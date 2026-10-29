import { demoWorkspace } from "../../src/data/demo";
import { test, expect } from "@playwright/test";
import { navigateWorkspace, route } from "./support";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(workspace => {
    localStorage.setItem("pmwork:workspace:v3", JSON.stringify(workspace));
  }, demoWorkspace("en"));
});

for (const locale of ["ru", "en"] as const) {
  test(`document controls remain compact and work ${locale}`, async ({ page }, testInfo) => {
    if (testInfo.project.name.includes("mobile")) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route(`/${locale}/workspace/`));
    await navigateWorkspace(page, locale === "ru" ? "Документы" : "Documents");

    const card = page.locator(".document-card").first();
    await expect(card).toBeVisible();
    const title = await card.locator("h3").innerText();
    const createName = locale === "ru" ? "Создать документ" : "Create document";
    await expect(page.getByRole("button", { name: createName })).toBeVisible();
    const search = page.getByRole("textbox", { name: locale === "ru" ? "Поиск документов" : "Search documents" });
    await search.fill(title);
    await expect(page.locator(".document-card")).toHaveCount(1);

    const filter = page.locator(".documents-filter-disclosure > summary");
    await filter.click();
    const category = page.getByRole("button", { name: locale === "ru" ? "Заметки и прочее" : "Notes & other", exact: true });
    await expect(category).toBeVisible();
    await category.click();
    await expect(category).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".documents-filter-disclosure")).not.toHaveAttribute("open", "");
    const createdTitle = `UX document ${locale}`;
    await search.fill(createdTitle);
    await page.getByRole("button", { name: createName }).click();
    const editor = page.getByRole("dialog");
    await editor.getByLabel(locale === "ru" ? "Название" : "Title", { exact: true }).fill(createdTitle);
    await editor.getByRole("button", { name: locale === "ru" ? "Создать" : "Create", exact: true }).click();
    await expect(page.getByRole("heading", { name: createdTitle, exact: true })).toBeVisible();
    if (testInfo.project.name.includes("mobile")) {
      expect(await page.locator("html").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    if (testInfo.project.name.includes("mobile")) {
      expect(await page.locator(".document-card").first().evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(844);
    }
  });
}
