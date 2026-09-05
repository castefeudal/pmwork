import { demoWorkspace } from "../../src/data/demo";
import { navigateWorkspace } from "./support";
import { test, expect } from "@playwright/test";
import { route } from "./support";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({page}) => {
 await page.addInitScript(workspace => { if(!localStorage.getItem("pmwork:workspace:v3")) localStorage.setItem("pmwork:workspace:v3",JSON.stringify(workspace)); },demoWorkspace("en"));
});
for (const locale of ["ru", "en"] as const) {
  test(`${locale} critical workspace journey`, async ({ page }) => {
    await page.goto(route(`/${locale}/workspace/`));
    await expect(
      page.getByText(
        locale === "ru"
          ? "Приоритетные управленческие действия"
          : "Priority management actions",
      ),
    ).toBeVisible();
    await navigateWorkspace(page,locale === "ru" ? "Работа" : "Work");
    await page
      .getByRole("button", {
        name: locale === "ru" ? "Добавить" : "Add",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog").getByLabel(locale === "ru" ? "Название" : "Title", {exact: true})
      .fill(`E2E ${locale}`);
    await page
      .getByRole("button", { name: locale === "ru" ? "Создать" : "Create" })
      .click();
    await expect(page.getByText(`E2E ${locale}`).filter({visible:true})).toBeVisible();
    await navigateWorkspace(page,locale === "ru" ? "Доска" : "Board");
    const card = page
      .locator(".work-card")
      .filter({ hasText: `E2E ${locale}` });
    await card
      .getByRole("button", {
        name: locale === "ru" ? "Переместить вправо" : "Move right",
      })
      .click();
    await navigateWorkspace(page,"RAID");
    await page
      .getByRole("button", {
        name: locale === "ru" ? "Добавить запись" : "Add risk",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog").getByLabel(locale === "ru" ? "Название" : "Title", {exact: true})
      .fill(`Risk ${locale}`);
    await page
      .getByRole("button", {
        name: locale === "ru" ? "Создать" : "Create",
        exact: true,
      })
      .click();
    await expect(page.getByText(`Risk ${locale}`, {exact:true})).toBeVisible();
    await page.waitForTimeout(600);
    await page.reload();
    await navigateWorkspace(page,locale === "ru" ? "Работа" : "Work");
    await expect(page.getByText(`E2E ${locale}`).filter({visible:true})).toBeVisible();
  });
}
test("landing has no serious accessibility violations", async ({ page }) => {
  await page.goto(route("/ru/"));
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(
    results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});
test("responsive public navigation works", async ({ page }, testInfo) => {
  await page.goto(route("/ru/"));
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await expect(
      page.getByRole("navigation", { name: "Мобильная навигация" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Мобильная навигация" })
      .getByRole("link", { name: "Методы", exact: true })
      .click();
  } else { await page.locator(".public-nav-group summary").first().click(); await page.getByRole("link", { name: "Методы", exact: true }).click(); }
  await expect(
    page.getByRole("heading", { name: "Библиотека методов" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});
test("public routes reflow without page overflow", async ({ page }) => {
  for (const path of [
    "/ru/",
    "/ru/methods/",
    "/en/tools/",
    "/ru/glossary/",
    "/en/about/",
  ]) {
    await page.goto(route(path));
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page
        .locator("html")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      path,
    ).toBe(true);
  }
});
test("workspace falls back when IndexedDB is unavailable", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "indexedDB", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto(route("/en/workspace/"));
  await expect(page.getByText("Priority management actions")).toBeVisible({
    timeout: 5000,
  });
});
test("workspace has no serious accessibility violations", async ({ page }) => {
  await page.goto(route("/en/workspace/"));
  await expect(page.getByText("Priority management actions")).toBeVisible();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(
    results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});
