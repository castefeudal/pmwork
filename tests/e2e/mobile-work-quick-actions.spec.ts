import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { demoWorkspace } from "../../src/data/demo";
import { navigateWorkspace, route } from "./support";

for (const locale of ["ru", "en"] as const) {
  test(`${locale} mobile work cards update and reopen an item without opening its editor`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(workspace => {
      localStorage.setItem("pmwork:workspace:v3", JSON.stringify(workspace));
    }, demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/`));
    await navigateWorkspace(page, locale === "ru" ? "Работа" : "Work");

    const title = locale === "ru" ? "Согласовать границы первого релиза" : "Align first-release scope";
    const card = page.locator(".mobile-work-card").filter({ hasText: title });
    await expect(card).toBeVisible();
    const item = card.locator("..");
    const status = page.getByRole("combobox", { name: `${locale === "ru" ? "Статус" : "Status"} ${title}` });
    await status.selectOption("in-progress");
    await expect(status).toHaveValue("in-progress");

    await item.getByRole("button", { name: locale === "ru" ? "Завершить" : "Complete" }).click();
    await expect(status).toHaveValue("done");
    await item.getByRole("button", { name: locale === "ru" ? "Вернуть в работу" : "Reopen" }).click();
    await expect(status).toHaveValue("ready");

    await page.waitForTimeout(500);
    await page.screenshot({ path: `test-results/mobile-work-${locale}-${testInfo.project.name}.png`, fullPage: true, animations: "disabled" });
    const accessibility = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
    await page.setViewportSize({ width: 320, height: 760 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(item).toBeVisible();
    await page.reload();
    await navigateWorkspace(page, locale === "ru" ? "Работа" : "Work");
    await expect(page.getByRole("combobox", { name: `${locale === "ru" ? "Статус" : "Status"} ${title}` })).toHaveValue("ready");
  });
}
