import { expect, test, type Page } from "@playwright/test";

test.setTimeout(120_000);
test.describe.configure({ mode: "serial" });

const STEP_IDS = ["c1", "i1", "k1", "c2", "i2", "c3", "i3", "k2", "k3", "ch1", "r1"] as const;
const CASES = [
  { lesson: "rno-01-01", step: "c1", index: 0, claims: ["-3", "-5", "-8"], direction: /left/i, arrow: "left" },
  { lesson: "rno-01-01", step: "c2", index: 3, claims: ["-3", "-5", "-8"], direction: /left/i, arrow: "left" },
  { lesson: "rno-02-01", step: "c1", index: 0, claims: ["5 - 3", "5 + (-3)", "= 2"], direction: /rewritten|plus negative|adding/i },
  { lesson: "rno-02-02", step: "c1", index: 0, claims: ["-3", "5", "8"], direction: /right|rise|positive/i, arrow: "right" },
  { lesson: "rno-02-02", step: "c2", index: 3, claims: ["10", "4", "-6"], direction: /left|down|fall|negative change/i, arrow: "left" },
  { lesson: "rno-02-03", step: "c3", index: 5, claims: ["a - (-b)", "a + b"], direction: /opposite|positive/i },
  { lesson: "rno-04-02", step: "c1", index: 0, claims: ["-2.5", "1.75", "-0.75"], direction: /different signs|larger magnitude/i },
  { lesson: "rno-04-02", step: "c2", index: 3, claims: ["3.25", "-1.5", "4.75"], direction: /opposite|plus/i },
] as const;

async function openConcept(page: Page, lesson: string, index: number, zoom: number): Promise<void> {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.addInitScript(({ lessonId, stepIds, i }) => {
    window.localStorage.clear();
    window.localStorage.setItem(
      `numera:lesson:v1:c1:${lessonId}`,
      JSON.stringify({
        v: 1,
        lessonId,
        stepIds,
        i,
        sessionXp: 0,
        history: [],
        injected: [],
        predictions: [],
        signalCounts: {},
        remediated: [],
        savedAt: "2026-08-18T12:00:00.000Z",
      }),
    );
    window.localStorage.setItem(
      "numera:profile:v1:c1",
      JSON.stringify({ xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [] }),
    );
  }, { lessonId: lesson, stepIds: [...STEP_IDS], i: index });
  await page.goto(`/learn/${lesson}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  if (zoom !== 1) await page.evaluate((factor) => { document.documentElement.style.zoom = String(factor); }, zoom);
  await expect(page.locator(".trail-concept-stage svg[role='img']")).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(250); // allow the lazy figure chunk and SVG-LaTeX hydration to settle
}

type Finding = { text: string; why: string };

function normalizeMath(value: string): string {
  return value.replace(/[−–—]/g, "-").replace(/\s+/g, " ").trim();
}

async function clippingFindings(page: Page): Promise<{
  labels: number;
  findings: Finding[];
  scrollWidth: number;
  clientWidth: number;
  visibleText: string;
  title: string;
  aria: string;
  directions: string[];
}> {
  return page.locator(".trail-concept-stage").evaluate((stage) => {
    const stageRect = stage.getBoundingClientRect();
    const viewport = { left: 0, top: 0, right: document.documentElement.clientWidth, bottom: window.innerHeight };
    const findings: Finding[] = [];
    const candidates = Array.from(stage.querySelectorAll("svg text, foreignObject[data-svg-latex-overlay] .svg-latex-overlay"));
    const visible = candidates.filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    });

    for (const element of visible) {
      const rect = element.getBoundingClientRect();
      const text = (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (rect.left < stageRect.left - 1 || rect.right > stageRect.right + 1 || rect.top < stageRect.top - 1 || rect.bottom > stageRect.bottom + 1)
        findings.push({ text, why: "outside concept stage" });
      if (rect.right <= viewport.left || rect.left >= viewport.right || rect.bottom <= viewport.top || rect.top >= viewport.bottom)
        findings.push({ text, why: "outside viewport" });
      for (let parent = element.parentElement; parent && parent !== stage; parent = parent.parentElement) {
        const overflow = getComputedStyle(parent);
        if (![overflow.overflowX, overflow.overflowY].some((value) => value === "hidden" || value === "clip")) continue;
        const clip = parent.getBoundingClientRect();
        if (rect.left < clip.left - 1 || rect.right > clip.right + 1 || rect.top < clip.top - 1 || rect.bottom > clip.bottom + 1) {
          findings.push({ text, why: `clipped by ${parent.tagName.toLowerCase()}` });
          break;
        }
      }
    }
    return {
      labels: visible.length,
      findings,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      visibleText: visible.map((element) => element.textContent ?? "").join(" "),
      title: stage.querySelector("svg[role='img'] title")?.textContent ?? "",
      aria: stage.querySelector("svg[role='img']")?.getAttribute("aria-label") ?? "",
      directions: Array.from(stage.querySelectorAll("[data-number-line-direction]"), (node) => node.getAttribute("data-number-line-direction") ?? ""),
    };
  });
}

for (const zoom of [1, 2] as const) {
  test.describe(`S260 RNO concept figures at 360px and ${zoom * 100}% zoom`, () => {
    for (const sample of CASES) {
      test(`${sample.lesson}/${sample.step} keeps every painted label visible`, async ({ page }) => {
        const browserErrors: string[] = [];
        page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
        page.on("pageerror", (error) => browserErrors.push(error.message));
        await openConcept(page, sample.lesson, sample.index, zoom);
        const result = await clippingFindings(page);
        expect(result.labels, "the rendered proof found no painted SVG/KaTeX labels").toBeGreaterThan(0);
        expect(result.findings, result.findings.map((finding) => `${finding.why}: ${finding.text}`).join("\n")).toEqual([]);
        expect(result.scrollWidth, "the figure creates horizontal page scrolling").toBeLessThanOrEqual(result.clientWidth + 1);
        const semanticEvidence = normalizeMath(`${result.visibleText} ${result.title} ${result.aria}`);
        for (const claim of sample.claims) {
          expect(semanticEvidence, `missing signed operand/result ${claim}`).toContain(claim);
        }
        expect(semanticEvidence, "visible text/title/ARIA does not state the expected movement or rewrite direction").toMatch(sample.direction);
        if ("arrow" in sample) {
          expect(result.directions, `direction metadata does not preserve the ${sample.arrow} arrow`).toContain(sample.arrow);
        }
        // Next dev strips the request nonce from the hydrated script attribute and emits its own
        // known dev-overlay mismatch; production does not. Keep that harness diagnostic separate
        // while failing every actual page/runtime/figure error.
        const actionableErrors = browserErrors.filter((message) => !(message.includes("A tree hydrated") && message.includes("nonce=")));
        expect(actionableErrors, `browser errors: ${actionableErrors.join(" | ")}`).toEqual([]);
      });
    }
  });
}
