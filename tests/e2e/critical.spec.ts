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
    await expect(page.getByText(locale === "ru" ? "Требуется действие" : "Requires action")).toBeVisible();
    await navigateWorkspace(page,locale === "ru" ? "Работа" : "Work");
    await page.locator('.workspace-top button[aria-haspopup="dialog"]').click();
    const add=page.getByRole('dialog',{name:locale==='ru'?'Добавить':'Add'});
    await add.getByRole('button',{name:locale==='ru'?'Работа':'Work item',exact:true}).click();
    const editor=page.getByRole("dialog");
    await editor.getByLabel(locale === "ru" ? "Название" : "Title", {exact: true}).fill(`E2E ${locale}`);
    await editor.getByLabel(locale === "ru" ? "Владелец" : "Owner",{exact:true}).fill("Release owner");
    await editor.getByLabel(locale === "ru" ? "Срок / дата пересмотра" : "Due / review date",{exact:true}).fill("2026-10-01");
    await editor.getByRole("button", { name: locale === "ru" ? "Создать" : "Create" }).click();
    await expect(page.getByText(`E2E ${locale}`).filter({visible:true})).toBeVisible();
    await navigateWorkspace(page,locale === "ru" ? "Доска" : "Board");
    const card = page.locator(".work-card").filter({ hasText: `E2E ${locale}` });
    await card.getByRole("button", {name: locale === "ru" ? "Переместить вправо" : "Move right"}).click();
    await navigateWorkspace(page,locale === "ru" ? "Риски и решения" : "Risks & decisions");
    await page.getByRole("button", {name: locale === "ru" ? "Добавить запись" : "Add risk",exact: true}).click();
    await page.getByRole("dialog").getByLabel(locale === "ru" ? "Название" : "Title", {exact: true}).fill(`Risk ${locale}`);
    await page.getByRole("dialog").getByLabel(locale === "ru" ? "Вероятность 1–5" : "Probability 1–5",{exact:true}).fill("5");
    await page.getByRole("dialog").getByLabel(locale === "ru" ? "Влияние 1–5" : "Impact 1–5",{exact:true}).fill("5");
    await page.getByRole("dialog").getByLabel(locale === "ru" ? "Меры реагирования" : "Response actions",{exact:true}).fill("Complete security evidence before release review");
    await page.getByRole("button", { name: locale === "ru" ? "Создать" : "Create", exact: true }).click();
    await expect(page.getByText(`Risk ${locale}`, {exact:true})).toBeVisible();
    await expect.poll(()=>page.evaluate(title=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (s.workspace??s).risks.some((r:{title:string})=>r.title===title)},`Risk ${locale}`)).toBe(true);await page.reload();
    await navigateWorkspace(page,locale === "ru" ? "Работа" : "Work");
    await expect(page.getByText(`E2E ${locale}`).filter({visible:true})).toBeVisible();
    const saved=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem("pmwork:workspace:v3")!);return s.workspace??s;});
    expect(saved.workItems.find((x:{title:string})=>x.title===`E2E ${locale}`)).toMatchObject({owner:"Release owner",dueDate:"2026-10-01",status:"ready"});
    expect(saved.risks.find((x:{title:string})=>x.title===`Risk ${locale}`)).toMatchObject({probability:5,impact:5,actions:"Complete security evidence before release review"});
  });
}
test("landing has no serious accessibility violations", async ({ page }) => {
  await page.goto(route("/ru/"));
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});
test("responsive public navigation works", async ({ page }, testInfo) => {
  await page.goto(route("/ru/"));
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await expect(page.getByRole("navigation", { name: "Мобильная навигация" })).toBeVisible();
    await page.getByRole("navigation", { name: "Мобильная навигация" }).getByRole("link", { name: "Методы", exact: true }).click();
  } else { await page.locator(".public-nav-group summary").first().click(); await page.getByRole("link", { name: "Методы", exact: true }).click(); }
  await expect(page.getByRole("heading", { name: "Выберите способ работы по контексту" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});
test("public routes reflow without page overflow", async ({ page }) => {
  for (const path of ["/ru/","/ru/methods/","/en/tools/","/ru/glossary/","/en/about/"]) {
    await page.goto(route(path)); await expect(page.locator("main")).toBeVisible();
    expect(await page.locator("html").evaluate((el) => el.scrollWidth <= el.clientWidth + 1),path).toBe(true);
  }
});
test("workspace falls back when IndexedDB is unavailable", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "indexedDB", {value: undefined, configurable: true}));
  await page.goto(route("/en/workspace/")); await expect(page.getByText("Requires action")).toBeVisible({timeout: 5000});
});
test("workspace has no serious accessibility violations", async ({ page }) => {
  await page.goto(route("/en/workspace/")); await expect(page.getByText("Requires action")).toBeVisible();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});
