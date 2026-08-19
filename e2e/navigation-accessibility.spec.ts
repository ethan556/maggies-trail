import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("navigation accessibility at 390px", () => {
  test("public, shell, and lesson surfaces bypass repeated navigation", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());

    for (const path of ["/", "/dashboard", "/learn/as100-01-01"]) {
      await page.goto(path);
      const target = page.locator("#main-content");
      await expect(target).toHaveCount(1);

      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: "Skip to main content" });
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();

      await page.keyboard.press("Enter");
      await expect(target).toBeFocused();
    }
  });

  test("More is a contained modal and restores its trigger after every dismissal", async ({ page }) => {
    await page.goto("/dashboard");
    const trigger = page.getByRole("button", { name: "More" });
    await trigger.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "More destinations" });
    const firstDestination = dialog.getByRole("link", { name: "Trailhead" });
    const close = dialog.getByRole("button", { name: "Close menu" });
    const theme = dialog.getByRole("button", { name: /Switch to (dark|light) mode/ });
    await expect(dialog).toBeVisible();
    await expect(firstDestination).toBeFocused();

    await theme.focus();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(theme).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(firstDestination).toBeFocused();
    await dialog.locator(':scope > button[aria-hidden="true"]').click({ position: { x: 5, y: 5 } });
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
});
