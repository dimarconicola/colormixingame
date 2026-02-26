import { expect, test } from "@playwright/test";

async function resetStorage(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();
}

test.describe("chroma mix design shell", () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test("switches across all top-level modes", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Solve Mode" })).toBeVisible();

    await page.getByRole("button", { name: "Predict" }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Predict Mode" })).toBeVisible();

    await page.getByRole("button", { name: "Find the Twin" }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Find the Twin" })).toBeVisible();

    await page.getByRole("button", { name: "Color Diary" }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Color Diary" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "My Color Diary" })).toBeVisible();
  });

  test("solve mode updates drop budget while mixing", async ({ page }) => {
    await expect(page.getByText("Drop Budget")).toBeVisible();
    await expect(page.getByText("0/8")).toBeVisible();

    await page.getByRole("button", { name: /Yellow/i }).click();
    await expect(page.getByText("1/8")).toBeVisible();

    await page.getByRole("button", { name: /Ultramarine/i }).click();
    await expect(page.getByText("2/8")).toBeVisible();
  });

  test("predict and twin modes support option selection flow", async ({ page }) => {
    await page.getByRole("button", { name: "Predict" }).first().click();
    await page.getByRole("button", { name: /OPTION A/i }).first().click();
    await expect(page.getByRole("button", { name: "Confirm Guess" })).toBeVisible();

    await page.getByRole("button", { name: "Find the Twin" }).first().click();
    await page.getByRole("button", { name: /OPTION B/i }).first().click();
    await expect(page.getByText("Ready to check?")).toBeVisible();
  });
});
