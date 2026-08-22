import { expect, test, type Page } from "@playwright/test";

async function pulseStyle(page: Page): Promise<{ animationName: string; animationDuration: string }> {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.className = "motion-safe:animate-pulse";
    probe.dataset.testid = "os-motion-pulse-probe";
    document.body.append(probe);
    const style = window.getComputedStyle(probe);
    const result = { animationName: style.animationName, animationDuration: style.animationDuration };
    probe.remove();
    return result;
  });
}

test.describe("OS reduced-motion pulse utility", () => {
  test("keeps pulse feedback in normal motion and removes it for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const normal = await pulseStyle(page);
    expect(normal.animationName).toBe("pulse");
    expect(normal.animationDuration).not.toBe("0s");

    await page.emulateMedia({ reducedMotion: "reduce" });
    const reduced = await pulseStyle(page);
    expect(reduced.animationName).toBe("none");
    expect(reduced.animationDuration).toBe("0s");
  });
});
