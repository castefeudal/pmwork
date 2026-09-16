import { expect, test } from "@playwright/test";

const base = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";

async function storedDemoName(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("pmwork:workspace:v3");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { workspace?: { projects?: Array<{ id: string; name: string }> }; projects?: Array<{ id: string; name: string }> };
    const workspace = parsed.workspace ?? parsed;
    return workspace.projects?.find((project) => project.id === "atlas")?.name ?? null;
  });
}

async function openDemo(page: import("@playwright/test").Page) {
  await page.goto(`${base}/en/workspace/`);
  const demo = page.getByRole("button", { name: /Explore a completed example/ });
  if (await demo.isVisible()) await demo.click();
  await expect(page.locator(".workspace-shell")).toBeVisible();
  await expect.poll(() => storedDemoName(page)).toBe("MARKOVMADE Digital Product Launch");
}

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
  await openDemo(page);
  await page.reload();
  await expect(page.locator(".workspace-shell")).toBeVisible();
  await expect.poll(() => storedDemoName(page)).toBe("MARKOVMADE Digital Product Launch");
});

test("locale switch keeps the workspace usable", async ({ page }) => {
  await openDemo(page);
  await page.getByRole("button", { name: "RU" }).click();
  await expect(page).toHaveURL(/\/ru\/workspace\//);
  await expect(page.locator(".workspace-shell")).toBeVisible();
  await expect.poll(() => storedDemoName(page)).toBe("MARKOVMADE Digital Product Launch");
});
