import { expect, test } from "@playwright/test";

const base = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";

test("public shell and workspace hydrate without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${base}/en/`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto(`${base}/en/workspace/`);
  await expect(page.getByText(/Start with a real project|Loading local workspace/)).toBeVisible();
  await expect.poll(() => errors).toEqual([]);
});

test("local-first demo path persists and survives reload", async ({ page }) => {
  await page.goto(`${base}/en/workspace/`);
  const demo = page.getByRole("button", { name: /Explore a completed example/ });
  if (await demo.isVisible()) await demo.click();
  await expect(page.getByRole("heading", { name: /MARKOVMADE Digital Product Launch/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: /MARKOVMADE Digital Product Launch/ })).toBeVisible();
});

test("locale switch keeps the workspace usable", async ({ page }) => {
  await page.goto(`${base}/en/workspace/`);
  const demo = page.getByRole("button", { name: /Explore a completed example/ });
  if (await demo.isVisible()) await demo.click();
  await page.getByRole("button", { name: "RU" }).click();
  await expect(page).toHaveURL(/\/ru\/workspace\//);
  await expect(page.getByRole("heading", { name: /MARKOVMADE/ })).toBeVisible();
});
