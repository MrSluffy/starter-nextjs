import { expect, test } from "@playwright/test";

test.describe("starter app flow", () => {
  test("walks through template selection and downloads a project", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Choose a Template" })).toBeVisible();
    await page.getByRole("button", { name: /dashboard/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();

    const projectNameInput = page.getByPlaceholder("my-next-app");
    await projectNameInput.fill("My Great App");
    await expect(projectNameInput).toHaveValue("my-great-app");

    await page.getByRole("button", { name: "Review" }).click();

    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(
      page.getByText("npx create-next-app@latest my-great-app", { exact: false }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /download my-great-app\.zip/i })).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download my-great-app\.zip/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("my-great-app.zip");
  });
});
