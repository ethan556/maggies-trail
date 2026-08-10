/*
 * S220 Wave 02 deterministic visual-certification harness.
 *
 * This is intentionally a standalone release gate, not part of the ordinary
 * Playwright suite. It requires a production/current-source server already
 * running at PW_BASE_URL (default :3100). Screenshot baselines always use
 * reduced motion so entry animations cannot be mistaken for final visual
 * defects. Motion semantics are a separate manual/browser gate.
 */
const { chromium } = require("playwright-core");
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const ROOT = resolve(__dirname, "../..");
const SPEC_PATH = resolve(__dirname, "closure-visual-matrix-s220.spec.json");
const spec = JSON.parse(readFileSync(SPEC_PATH, "utf8"));
const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:3100";
const OUT = resolve(process.env.CLOSURE_VISUAL_DIR || resolve(ROOT, "WAVE02_SCREENSHOTS"));
const SETTLE_MS = Number(process.env.CLOSURE_VISUAL_SETTLE_MS || 250);
const OVERFLOW_TOLERANCE_PX = 1;
const AS100 = {
  id: "as100-01-01",
  stepIds: ["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"]
};

function profile(extra = {}) {
  return {
    xp: 0,
    activity: { active: [], frozen: [] },
    review: [],
    lessons: {},
    badges: [],
    reduceMotion: true,
    ...extra
  };
}

async function chromiumExecutable() {
  if (process.env.PW_CHROMIUM_EXE) return process.env.PW_CHROMIUM_EXE;
  if (existsSync("/tmp/chromium")) return "/tmp/chromium";
  try {
    const mod = await import("@sparticuz/chromium");
    return await mod.default.executablePath();
  } catch (error) {
    throw new Error(
      "No Chromium executable. Set PW_CHROMIUM_EXE or install the exact lockfile dependencies. " +
        String(error)
    );
  }
}

async function installDeterministicPreferences(context, theme) {
  await context.addInitScript(({ theme }) => {
    try {
      localStorage.setItem("numera:theme", theme);
      const key = "numera:profile:v1:c1";
      const current = JSON.parse(localStorage.getItem(key) || "{}");
      localStorage.setItem(key, JSON.stringify({
        xp: 0,
        activity: { active: [], frozen: [] },
        review: [],
        lessons: {},
        badges: [],
        ...current,
        reduceMotion: true
      }));
    } catch (_) {}
  }, { theme });
}

async function seedCompletion(page) {
  await page.evaluate(({ lesson, storedProfile }) => {
    localStorage.setItem(`numera:lesson:v1:c1:${lesson.id}`, JSON.stringify({
      v: 1,
      lessonId: lesson.id,
      stepIds: lesson.stepIds,
      i: lesson.stepIds.length - 1,
      sessionXp: 42,
      history: [],
      injected: [],
      predictions: [],
      signalCounts: {},
      remediated: [],
      savedAt: "2026-08-09T12:00:00.000Z"
    }));
    localStorage.setItem("numera:profile:v1:c1", JSON.stringify(storedProfile));
  }, { lesson: AS100, storedProfile: profile() });
}

async function keyboardProbe(page) {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  return await page.evaluate(() => {
    const active = document.activeElement;
    if (!active || active === document.body || active === document.documentElement) {
      return { reachable: false, tag: null, label: null };
    }
    const rect = active.getBoundingClientRect();
    const style = getComputedStyle(active);
    const visible = rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    const label = active.getAttribute("aria-label") || active.textContent?.trim().slice(0, 80) || null;
    return { reachable: visible, tag: active.tagName.toLowerCase(), label };
  });
}

async function pageMetrics(page) {
  return await page.evaluate(() => {
    const root = document.documentElement;
    const controls = [...document.querySelectorAll("button, input, select, textarea, [role='button'], a[href]")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          width: Math.round(r.width * 10) / 10,
          height: Math.round(r.height * 10) / 10,
          label: el.getAttribute("aria-label") || el.textContent?.trim().replace(/\s+/g, " ").slice(0, 60) || ""
        };
      });
    const smallTargets = controls.filter((c) => c.width < 44 || c.height < 44).slice(0, 20);
    return {
      width: innerWidth,
      height: innerHeight,
      hOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
      documentHeight: root.scrollHeight,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 140) || null,
      visibleControlCount: controls.length,
      smallTargetCount24: controls.filter((c) => c.width < 24 || c.height < 24).length,
      smallTargetCount44: controls.filter((c) => c.width < 44 || c.height < 44).length,
      smallTargetExamples: smallTargets
    };
  });
}

async function capture(browser, viewport, theme, surface) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    hasTouch: viewport.hasTouch,
    isMobile: false,
    colorScheme: theme,
    reducedMotion: "reduce"
  });
  await installDeterministicPreferences(context, theme);
  const page = await context.newPage();
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });

  let status = null;
  let failure = null;
  try {
    if (surface.scenario === "lesson-completion") {
      await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await seedCompletion(page);
    }
    const response = await page.goto(`${BASE}${surface.path}`, { waitUntil: "networkidle", timeout: 45_000 });
    status = response ? response.status() : null;
    if (!response || status >= 400) throw new Error(`HTTP ${status}`);

    if (surface.scenario === "lesson-start") {
      await page.locator("[data-player-phase]").waitFor({ state: "visible", timeout: 15_000 });
    }
    if (surface.scenario === "lesson-completion") {
      await page.locator("[data-player-phase]").waitFor({ state: "visible", timeout: 15_000 });
      await page.keyboard.press("Enter");
      await page.getByRole("heading", { name: "Trail complete!" }).waitFor({ state: "visible", timeout: 15_000 });
    }

    await page.waitForTimeout(SETTLE_MS);
    const metrics = await pageMetrics(page);
    const screenshot = `${surface.id}--${viewport.id}--${theme}.png`;
    await page.screenshot({ path: resolve(OUT, screenshot), fullPage: false });
    const keyboard = viewport.hasTouch ? null : await keyboardProbe(page);

    if (metrics.hOverflow > OVERFLOW_TOLERANCE_PX) {
      failure = `horizontal overflow ${metrics.hOverflow}px`;
    } else if (viewport.hasTouch && metrics.smallTargetCount44 > 0) {
      failure = `${metrics.smallTargetCount44} touch targets smaller than 44px`;
    } else if (keyboard && !keyboard.reachable) {
      failure = "keyboard probe did not reach a visible focus target after 3 Tabs";
    }

    return {
      surface: surface.id,
      path: surface.path,
      scenario: surface.scenario || null,
      viewport: viewport.id,
      width: viewport.width,
      height: viewport.height,
      hasTouch: viewport.hasTouch,
      theme,
      reducedMotion: true,
      captureSettledMs: SETTLE_MS,
      status,
      finalUrl: page.url(),
      screenshot,
      keyboard,
      ...metrics,
      failure
    };
  } catch (error) {
    failure = String(error && error.message ? error.message : error);
    return {
      surface: surface.id,
      path: surface.path,
      scenario: surface.scenario || null,
      viewport: viewport.id,
      width: viewport.width,
      height: viewport.height,
      hasTouch: viewport.hasTouch,
      theme,
      reducedMotion: true,
      captureSettledMs: SETTLE_MS,
      status,
      finalUrl: page.url(),
      failure
    };
  } finally {
    await context.close();
  }
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const executablePath = await chromiumExecutable();
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  const captures = [];
  try {
    for (const theme of spec.themes) {
      for (const viewport of spec.viewports) {
        for (const surface of spec.surfaces) {
          const result = await capture(browser, viewport, theme, surface);
          captures.push(result);
          const mark = result.failure ? "✗" : "✓";
          console.log(
            `${mark} ${surface.id} ${viewport.id} ${theme}` +
              ` HTTP:${result.status ?? "?"} hOverflow:${result.hOverflow ?? "?"}` +
              (result.failure ? ` — ${result.failure}` : "")
          );
        }
      }
    }
  } finally {
    await browser.close();
  }

  const failures = captures.filter((c) => c.failure);
  const manifest = {
    schemaVersion: 1,
    session: spec.session,
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    screenshotMode: "deterministic reduced-motion final-state baseline",
    realBrowserZoom200Automated: false,
    manualGates: spec.manualGates,
    captureCount: captures.length,
    failureCount: failures.length,
    captures
  };
  writeFileSync(resolve(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`CLOSURE_VISUAL_MATRIX:${captures.length} captures; ${failures.length} failures`);
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error("CLOSURE_VISUAL_MATRIX_FATAL", error);
  process.exit(1);
});
