import { expect, test } from "@playwright/test";

async function resetStorage(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();
}

async function completeGuardianGate(page: import("@playwright/test").Page): Promise<void> {
  const challengeLine = page.getByText(/^Solve this quick check:/i);
  await expect(challengeLine).toBeVisible();

  const challengeText = (await challengeLine.textContent()) ?? "";
  const match = challengeText.match(/(\d+)\s*\+\s*(\d+)/);

  if (!match) {
    throw new Error(`Guardian challenge text could not be parsed: "${challengeText}"`);
  }

  const left = Number(match[1]);
  const right = Number(match[2]);
  const answer = String(left + right);

  await page.getByLabel("Answer").fill(answer);
  await page.getByRole("button", { name: /Unlock for 10 Minutes/i }).click();
}

test.describe("mode switching and color diary", () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test("switches across all top-level modes", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: /Solve Mode Vertical Slice/i })).toBeVisible();

    await page.getByRole("tab", { name: "Predict" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: /Predict Mode Vertical Slice/i })
    ).toBeVisible();

    await page.getByRole("tab", { name: "Find the Twin" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: /Find the Twin Mode Vertical Slice/i })
    ).toBeVisible();

    await page.getByRole("tab", { name: "Color Diary" }).click();
    await expect(page.getByRole("heading", { level: 1, name: /Color Diary Vertical Slice/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Color Diary" })).toBeVisible();
  });

  test("saves a prediction result to diary and supports edit/delete", async ({ page }) => {
    await page.getByRole("tab", { name: "Predict" }).click();
    await page.getByRole("button", { name: "Start Prediction" }).click();

    await page.getByRole("radio", { name: /Option A/i }).click();
    await page.getByRole("button", { name: "Submit Prediction" }).click();

    await expect(page.getByText(/^Result$/)).toBeVisible();
    await page.getByRole("button", { name: "Save to Diary" }).click();

    await expect(page.getByRole("heading", { level: 1, name: /Color Diary Vertical Slice/i })).toBeVisible();
    await expect(page.locator(".diary-card")).toHaveCount(1);

    const updatedTitle = "E2E Updated Entry";
    const updatedNote = "Saved from Playwright baseline.";

    await page.getByLabel("Title").fill(updatedTitle);
    await page.getByLabel("Note").fill(updatedNote);
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page.getByRole("button", { name: new RegExp(updatedTitle, "i") })).toBeVisible();
    await page.getByRole("button", { name: "Delete Entry" }).click();
    await completeGuardianGate(page);

    await expect(
      page.getByText("Diary is empty for this filter. Save any result screen to start your collection wall.")
    ).toBeVisible();
    await expect(page.getByText("Select a diary card to edit title and notes.")).toBeVisible();
  });

  test("supports pack filtering and accessibility toggles", async ({ page }) => {
    await page.getByLabel("Pack").selectOption({ label: "Starter Essentials (Curated Path)" });
    await expect(page.getByText(/Current pack: Starter Essentials/i)).toBeVisible();

    await page.getByRole("button", { name: /High Contrast: Off/i }).click();
    await expect(page.locator("main.app-shell")).toHaveClass(/high-contrast/);

    await page.getByRole("tab", { name: "Find the Twin" }).click();
    await page.getByRole("button", { name: /Color Assist: Off/i }).first().click();
    await expect(page.locator(".assist-chip").first()).toBeVisible();
  });
});
