/**
 * S242 / ACC-01 §8(2) — REFLOW AND RESIZE, MEASURED IN A BROWSER.
 *
 * The accessibility matrix could not settle these and said so:
 *
 *   > No browser rendered anything. So: … no measured pixel sizes … **no confirmation that
 *   > `textScale: xl` does not overlap anything at 320px; no 200% browser-zoom reflow test, which
 *   > is the actual 1.4.4 AA mechanism.**
 *
 * The repo does have e2e — axe across 24 routes in both themes, viewport specs, forced-colors — but
 * measured against the config, **the narrowest viewport anything runs at is 360px**, and no spec
 * zooms. Those two numbers are exactly the ones the success criteria name:
 *
 *   · **1.4.10 Reflow (AA)** is specified at **320 CSS px** — content must not require scrolling in
 *     two directions. 360 is a phone; 320 is the standard.
 *   · **1.4.4 Resize Text (AA)** is 200%, and the mechanism browsers implement is zoom, which is
 *     equivalent to halving the viewport at the same device scale factor.
 *
 * WHAT IT ASSERTS. On each route: the document does not scroll horizontally, and no element the
 * learner must reach spills past the right edge. Overflow is measured against `documentElement`
 * rather than `body` because a `position: fixed` overlay can overflow one without the other.
 *
 * WHY IT RUNS ON THE PRODUCTION BUILD. `npm run dev` compiles each route on first request, and in
 * a cold container that alone exceeded Playwright's 30s navigation budget — the first run of
 * `smoke.spec.ts` here failed on `page.goto` timeouts, not on anything about the page. Point
 * `PW_BASE_URL` at a `next start` server.
 */
import { expect, test, type Page } from "@playwright/test";

/** Learner-facing surfaces with real layout pressure: a lesson stage, a catalogue, a dashboard. */
const ROUTES = ["/", "/dashboard", "/courses", "/learn/as100-01-01", "/review", "/notebook"];

/** 320 is 1.4.10's number. 640×… at deviceScaleFactor 2 is how a browser implements 200% zoom. */
const NARROW = { width: 320, height: 720 };

/**
 * THE FIRST REAL RUN OF THIS FUNCTION CORRECTED IT. Everything below the `getBoundingClientRect`
 * line was written while the page was blank — the CSP blocked hydration, `body *` returned 14
 * script elements, and a layout with no boxes cannot overflow. The moment the app hydrated, six of
 * these tests failed, and all six named the same two elements:
 *
 *     span.trail-atmosphere__ridge--far   right=358 > 320
 *     span.trail-atmosphere__ridge--near  right=346 > 320
 *
 * Those are the decorative ridge silhouettes in `TrailAtmosphere`. Their container is
 * `position: fixed; inset: 0; OVERFLOW: HIDDEN; pointer-events: none` and carries
 * `aria-hidden="true"`; the ridges are placed at `right: -8vw` deliberately, to bleed off the edge.
 * The browser paints nothing past 320 and the page does not scroll — the `scrollWidth` assertion,
 * which is 1.4.10's actual mechanism, passed on every one of the six.
 *
 * `getBoundingClientRect` reports an element's UNCLIPPED border box. It does not know about an
 * ancestor's `overflow: hidden`. So the walk was reporting geometry the learner cannot see, cannot
 * reach and cannot scroll to, and calling it a reflow failure. That is a measurement defect, and it
 * is the same one this session has hit repeatedly: the detector is wrong before the content is.
 *
 * The fix computes the VISIBLE rectangle — the intersection with every clipping ancestor — which is
 * what "spills past the right edge" was always meant to mean. It is not a relaxation: an element
 * genuinely overflowing an unclipped ancestor still reports, and an element inside a clipping
 * ancestor that ITSELF overflows still reports, because the ancestor's own rect is intersected too.
 * Only `overflow-x: hidden` and `clip` are treated as clipping. `auto`/`scroll` are NOT, because
 * there the content IS reachable — by a horizontal scroll, which is the thing 1.4.10 forbids.
 */
async function overflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const limit = doc.clientWidth;
    const spillers: string[] = [];

    /** The element's painted extent: its own box, clipped by every `overflow: hidden` ancestor. */
    const visibleRight = (el: Element): number => {
      let right = el.getBoundingClientRect().right;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ov = getComputedStyle(p).overflowX;
        if (ov === "hidden" || ov === "clip") right = Math.min(right, p.getBoundingClientRect().right);
      }
      return right;
    };

    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      // 1px of slack: sub-pixel layout rounding is not a reflow failure.
      const right = visibleRight(el);
      if (right > limit + 1) {
        const id = `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(/\s+/).slice(0, 2).join(".") : ""}`;
        spillers.push(`${id} right=${Math.round(right)} > ${limit}`);
      }
    }
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: limit,
      spillers: Array.from(new Set(spillers)).slice(0, 6),
    };
  });
}

test.describe("S242 — 1.4.10 Reflow at 320px", () => {
  for (const route of ROUTES) {
    test(`${route} reflows at 320px without horizontal scrolling`, async ({ page }) => {
      await page.setViewportSize(NARROW);
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(400); // let the stage settle after hydration
      const seen = await overflow(page);
      expect(
        seen.scrollWidth,
        `${route}: the page scrolls horizontally at 320px (1.4.10)`
      ).toBeLessThanOrEqual(seen.clientWidth + 1);
      expect(seen.spillers, `${route}: elements spill past the right edge at 320px`).toEqual([]);
    });
  }
});

test.describe("S242 — 1.4.10 at 320px with the largest text scale", () => {
  for (const route of ROUTES) {
    test(`${route} reflows at 320px with textScale xl`, async ({ page }) => {
      /* The reading preferences live IN THE PROFILE, not in standalone keys — `ProfileClient` sets
       * `document.documentElement.dataset.textScale` from `profile.textScale`, and the pre-paint
       * bootstrap reads `numera:profile:v1:c1`. Writing the profile is what a learner who turned
       * these on actually has; `xl` is 115% of root font size, which is where overlap appears. */
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "numera:profile:v1:c1",
          JSON.stringify({ xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [], textScale: "xl", openReading: true })
        );
      });
      await page.setViewportSize(NARROW);
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(400);
      const seen = await overflow(page);
      expect(
        seen.scrollWidth,
        `${route}: horizontal scrolling at 320px once text is scaled up (1.4.4 + 1.4.10)`
      ).toBeLessThanOrEqual(seen.clientWidth + 1);
      expect(seen.spillers, `${route}: elements spill past the right edge at 320px with xl text`).toEqual([]);
    });
  }
});


/**
 * S242 / SEC-02 — THE PAGE MUST ACTUALLY HYDRATE. IT NOW DOES; THIS IS WHAT MADE IT NOT.
 *
 * RESOLVED 2026-08-17 by `src/middleware.ts`: the policy moved from static SHA-256 hashes in
 * `next.config.mjs` to a per-request nonce, which is the only mechanism that can cover a payload
 * generated per response. The account below is left standing because it is the diagnosis, and
 * because the assertions under it are the ones that would catch a repeat. `e2e/s242-csp.spec.ts`
 * now carries the fuller version — every script nonced, one CSP header, no console violation.
 *
 * THIS IS THE FINDING OF THE PACKET, AND IT WAS FOUND BY THE GUARD RATHER THAN BY THE ASSERTION.
 *
 * The reflow checks above passed on the first run. They were passing because the page renders
 * NOTHING: `document.querySelectorAll("body *")` returns 14 elements on `/dashboard` and every one
 * of them is a `<script>`. A layout with no boxes cannot overflow, so "no horizontal scrolling at
 * 320px" was true and meaningless. The keyboard walk drafted alongside it reported zero focusable
 * elements, and ITS paired-acceptance guard is what refused to let that ship.
 *
 * The cause, from the browser console:
 *
 *   > Refused to execute inline script because it violates the following Content Security Policy
 *   > directive: "script-src 'self' 'sha256-9r4UfGgq…' 'sha256-7Yd61Ocs…'"
 *
 * `next.config.mjs` allows exactly two inline scripts by hash — `themeInit` and `motionInit` — and
 * that part works. But **Next.js serves 15 inline scripts per page and 13 of them are not in the
 * list**: React's streaming runtime (`$RB`, `$RV`, `requestAnimationFrame`) and every chunk of the
 * RSC payload (`self.__next_f.push([1,"…"])`). Those are per-page and content-dependent; they
 * cannot appear in a static hash list. So hydration never runs. The server sends 385 KB of correct
 * HTML and the browser shows an application that never starts.
 *
 * `headers()` carries no environment guard, so this applies in `next start` AND `next dev`.
 *
 * WHY NOTHING CAUGHT IT. `securityHeaders.s242.test.ts` verifies the two hashes are not stale — and
 * says so explicitly: *"DELIBERATELY NOT ASSERTED HERE: that the headers actually arrive on an HTTP
 * response. That needs a running server and belongs in the e2e layer."* The e2e layer never asserted
 * that a page becomes interactive, so an axe sweep of a blank page finds zero violations and passes.
 *
 * THE FIX WAS A DECISION, NOT AN EDIT, and was deliberately left to the owner: a CSP is a security
 * control. The three routes were a per-request nonce (which the config rejected on purpose, because
 * it forces every static route dynamic), `'unsafe-inline'` on `script-src` (which gives up the
 * property the hashes were bought with), or serving the strict policy only on routes that do not
 * stream. THE NONCE WAS CHOSEN. Its cost is stated and measured in `src/middleware.ts`: the build
 * went from 21 static routes to 1, and all 21 were client-rendered shells.
 */
test.describe("S242 — the app hydrates", () => {
  for (const route of ["/", "/dashboard", "/learn/as100-01-01"]) {
    test(`${route} renders interactive content`, async ({ page }) => {
      const blocked: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" && /Content Security Policy/i.test(m.text())) blocked.push(m.text().slice(0, 120));
      });
      await page.goto(route, { waitUntil: "networkidle", timeout: 90_000 });
      await page.waitForTimeout(1500);
      const seen = await page.evaluate(() => ({
        nonScript: document.querySelectorAll("body *:not(script)").length,
        focusable: document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])").length,
      }));
      expect(blocked, `${route}: the Content Security Policy is blocking scripts the app needs`).toEqual([]);
      expect(seen.nonScript, `${route}: the body contains only <script> elements — the app never hydrated`).toBeGreaterThan(20);
      expect(seen.focusable, `${route}: no keyboard-reachable control rendered`).toBeGreaterThan(3);
    });
  }
});
