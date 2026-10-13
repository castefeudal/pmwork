import AxeBuilder from "@axe-core/playwright";
import { demoWorkspace } from "../../src/data/demo";
import { expect, test } from "@playwright/test";
import { navigateWorkspace, route } from "./support";

for (const locale of ["ru", "en"] as const) {
  const ru = locale === "ru";

  test(`risk creation stays clear and progressive on mobile (${locale})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const workspace = demoWorkspace(locale);
    await page.addInitScript((value) => {
      localStorage.setItem("pmwork:workspace:v3", JSON.stringify(value));
    }, workspace);
    await page.goto(route(`/${locale}/workspace/`));
    await navigateWorkspace(page, ru ? "Риски и решения" : "Risks & decisions");
    await page.getByRole("button", { name: ru ? "Добавить риск" : "Add risk", exact: true }).click();

    const dialog = page.getByRole("dialog", { name: ru ? "Новый риск" : "New risk" });
    const likelihood = dialog.getByLabel(ru ? "Вероятность (1–5)" : "Likelihood (1–5)", { exact: true });
    const impact = dialog.getByLabel(ru ? "Влияние (1–5)" : "Impact (1–5)", { exact: true });
    await expect(likelihood).toHaveValue("3");
    await expect(likelihood).toHaveAttribute("min", "1");
    await expect(likelihood).toHaveAttribute("max", "5");
    await expect(dialog.getByText(ru ? "3 — начальная оценка" : "3 is a starting estimate")).toBeVisible();
    await expect(dialog.getByLabel(ru ? "Денежное влияние" : "Monetary impact", { exact: true })).toBeHidden();

    await likelihood.fill("6");
    expect(await likelihood.evaluate((element) => (element as HTMLInputElement).validity.valid)).toBe(false);
    await likelihood.fill("4");
    await impact.fill("5");
    await dialog.getByText(ru ? "Денежная оценка — необязательно" : "Financial estimate — optional").click();
    const financialImpact = dialog.getByLabel(ru ? "Денежное влияние" : "Monetary impact", { exact: true });
    await expect(financialImpact).toBeVisible();
    await expect(financialImpact).toHaveAttribute("min", "0");
    await financialImpact.fill("-1");
    expect(await financialImpact.evaluate((element) => (element as HTMLInputElement).validity.valid)).toBe(false);
    await financialImpact.fill("20000");
    await dialog.getByLabel(ru ? "Вероятность, % (0–100)" : "Probability, % (0–100)", { exact: true }).fill("25");
    await dialog.getByLabel(ru ? "Остаточная вероятность, %" : "Residual probability, %", { exact: true }).fill("10");
    await dialog.getByLabel(ru ? "Остаточное денежное влияние" : "Residual monetary impact", { exact: true }).fill("5000");
    await dialog.getByLabel(ru ? "Стоимость реагирования" : "Response cost", { exact: true }).fill("750");
    await page.screenshot({ path: testInfo.outputPath(`risk-create-${locale}.png`), fullPage: true, animations: "disabled" });

    const axe = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations).toEqual([]);
    const layout = await page.evaluate(() => {
      return { document: document.documentElement.scrollWidth, viewport: window.innerWidth, screen: window.screen.width };
    });
    const viewport = testInfo.project.name === "mobile-webkit-smoke" ? layout.screen : layout.viewport;
    expect(layout.document).toBeLessThanOrEqual(viewport + 1);

    await dialog.getByLabel(ru ? "Название" : "Title", { exact: true }).fill(`Supply delay ${locale}`);
    await dialog.getByRole("button", { name: ru ? "Создать" : "Create", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(`Supply delay ${locale}`, { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate((title) => {
      const parsed = JSON.parse(localStorage.getItem("pmwork:workspace:v3")!);
      const stored = parsed.workspace ?? parsed;
      return stored.risks.find((risk: { title: string }) => risk.title === title);
    }, `Supply delay ${locale}`)).toMatchObject({
      probability: 4,
      impact: 5,
      probabilityPct: 25,
      impactAmount: 20000,
      residualProbabilityPct: 10,
      residualImpactAmount: 5000,
      responseCost: 750,
    });
  });
}
