import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { demoWorkspace } from "../../src/data/demo";
import { route } from "./support";

test("planning and RAID tabs fit on a narrow phone without clipped labels", async ({ page }) => {
  const locale = "en";
  await page.addInitScript(value => localStorage.setItem("pmwork:workspace:v3", JSON.stringify(value)), demoWorkspace(locale));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const view of ["planning", "raid"]) {
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=${view}`));
    const tabs = page.locator(".workspace-content > .tabs");
    await expect(tabs).toBeVisible();
    expect(await tabs.evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(await tabs.evaluate(element => element.clientWidth) + 1);
  }
});

for (const locale of ["ru", "en"] as const) test(`milestone-only planning preserves dated evidence (${locale})`, async ({ page }, info) => {
  test.setTimeout(120000);
  const ru = locale === "ru";
  const workspace = demoWorkspace(locale);
  workspace.workItems = workspace.workItems.map(item => item.projectId === "atlas" ? {...item, startDate:undefined, dueDate:undefined} : item);
  const milestone = workspace.milestones.find(item => item.projectId === "atlas")!;
  milestone.baselineDate = "2025-01-01";
  milestone.forecastDate = milestone.date = "2026-06-12";
  milestone.actualDate = "2026-06-15";
  milestone.status = "done";
  milestone.progress = 100;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(value => localStorage.setItem("pmwork:workspace:v3", JSON.stringify(value)), workspace);
  await page.goto(route(`/${locale}/workspace/?project=atlas&view=planning`));
  const panel = page.locator(".planning-panel");
  await expect(panel).toBeVisible();
  const chart = page.getByRole("region", { name: ru ? "Календарный график" : "Schedule timeline" });
  for (const width of [320,360,390,430,768,1024,1280,1440,1920,2560]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    if (width === 390 || width === 1440) await page.screenshot({path:info.outputPath(`milestones-${locale}-${width}.png`), fullPage:true});
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const toggle = panel.getByRole("button", { name: ru ? "Открыть полный timeline" : "Open full timeline" });
  await toggle.click();
  await expect(panel.getByRole("button", { name: ru ? "Скрыть timeline" : "Hide timeline" })).toHaveAttribute("aria-expanded", "true");
  await expect(chart).toBeVisible();
  await expect(chart.locator(".timeline-axis-caption")).toContainText("2025");
  await panel.locator(".timeline-options > summary").click();
  for (const scale of ["project", "week", "day"]) {
    await panel.getByRole("combobox", {name:ru?"Масштаб":"Scale"}).selectOption(scale);
    expect(await chart.locator(".timeline-tick").count()).toBeLessThanOrEqual(200);
  }
  await chart.focus();
  await expect(chart).toBeFocused();
  const marker = chart.getByRole("button", { name: new RegExp(`${milestone.title} · ${ru?"Факт":"Actual"}:`) });
  await expect(marker).toHaveCount(1);
  for (const theme of ["light","dark"]) {
    await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
    expect((await new AxeBuilder({page}).include(".planning-panel").analyze()).violations).toEqual([]);
  }
  await marker.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
