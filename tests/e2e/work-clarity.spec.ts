import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { demoWorkspace, emptyWorkspace } from "../../src/data/demo";
import { navigateWorkspace, route } from "./support";

// Audit settled theme colors, rather than a frame during their transition.
test.use({ reducedMotion: "reduce" });

for (const locale of ["ru", "en"] as const) {
  const ru = locale === "ru";
  test(`empty work view offers a useful first step (${locale})`, async ({ page }) => {
    const workspace = emptyWorkspace(locale);
    workspace.projects = [{ ...demoWorkspace(locale).projects[0], demo: false }];
    await page.addInitScript(value => localStorage.setItem("pmwork:workspace:v3", JSON.stringify(value)), workspace);
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=work`));
    const empty = page.locator(".empty-state").filter({ has: page.getByRole("heading", { name: ru ? "Добавьте первую работу" : "Add your first work item" }) });
    await expect(empty).toBeVisible();
    await expect(empty.getByRole("button", { name: ru ? "Показать всё" : "Show all" })).toHaveCount(0);
    await empty.getByRole("button", { name: ru ? "Добавить рабочий элемент" : "Add work item", exact: true }).click();
    await expect(page.getByRole("dialog", { name: ru ? "Новый рабочий элемент" : "New work item" })).toBeVisible();
  });

  test(`work filters preserve layout and display settings (${locale})`, async ({ page }, testInfo) => {
    await page.addInitScript(workspace => {
      if (!localStorage.getItem("pmwork:workspace:v3")) localStorage.setItem("pmwork:workspace:v3", JSON.stringify(workspace));
    }, demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=work&layout=board`));
    const modes = page.getByRole("group", { name: ru ? "Представление работы" : "Work view" });
    const board = modes.getByRole("button", { name: ru ? "Доска" : "Board", exact: true });
    await expect(board).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".board")).toBeVisible();
    await expect(page.getByRole("button", { name: ru ? "Доска" : "Board", exact: true })).toHaveCount(1);
    await page.getByText(ru ? "Вид и сортировка" : "Display and sorting", { exact: true }).click();
    await page.getByLabel(ru ? "Сортировка" : "Sort", { exact: true }).selectOption("due");
    await page.getByLabel(ru ? "Группировка списка" : "List grouping", { exact: true }).selectOption("owner");
    await page.getByLabel(ru ? "Трудоёмкость" : "Effort", { exact: true }).check();
    await page.getByText(ru ? "Вид и сортировка" : "Display and sorting", { exact: true }).click();
    await page.locator(".work-filter-disclosure summary").click();
    await page.locator(".work-filter-panel").getByLabel(ru ? "Статус" : "Status", { exact: true }).selectOption("ready");
    await page.locator(".work-filter-panel").getByLabel(ru ? "Владелец" : "Owner", { exact: true }).selectOption({ index: 1 });
    await page.locator(".work-filter-disclosure summary").click();
    const search = page.getByRole("textbox", { name: ru ? "Поиск работы" : "Search work" });
    await search.fill("unmatched-record-query");
    await expect(page.getByRole("heading", { name: ru ? "Нет подходящей работы" : "No matching work" })).toBeVisible();
    const filters = page.getByRole("group", { name: ru ? "Активные фильтры" : "Active filters" });
    await expect(filters.getByRole("button")).toHaveCount(4);
    await page.getByRole("button", { name: ru ? "Очистить поиск" : "Clear search", exact: true }).click();
    await expect(search).toBeFocused();
    await expect(filters.getByRole("button")).toHaveCount(3);
    await filters.getByRole("button", { name: new RegExp(`^${ru ? "Убрать фильтр: Статус" : "Remove filter: Status"}:`) }).click();
    await expect(search).toBeFocused();
    await expect(filters.getByRole("button")).toHaveCount(2);
    await filters.getByRole("button", { name: ru ? "Сбросить фильтры" : "Reset filters", exact: true }).click();
    await expect(filters).toHaveCount(0);
    await expect(board).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/layout=board/);
    await page.getByText(ru ? "Вид и сортировка" : "Display and sorting", { exact: true }).click();
    await expect(page.getByLabel(ru ? "Сортировка" : "Sort", { exact: true })).toHaveValue("due");
    await expect(page.getByLabel(ru ? "Группировка списка" : "List grouping", { exact: true })).toHaveValue("owner");
    await expect(page.getByLabel(ru ? "Трудоёмкость" : "Effort", { exact: true })).toBeChecked();
    await page.getByText(ru ? "Вид и сортировка" : "Display and sorting", { exact: true }).click();
    await navigateWorkspace(page, ru ? "Сейчас" : "Today");
    await navigateWorkspace(page, ru ? "Работа" : "Work");
    await expect(board).toHaveAttribute("aria-pressed", "true");
    await modes.getByRole("button", { name: ru ? "Список" : "List", exact: true }).click();
    await expect(page).toHaveURL(/layout=list/);
    await page.goBack();
    await expect(board).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".board")).toBeVisible();
    await expect.poll(() => page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("pmwork:workspace:v3")!);
      return (stored.workspace ?? stored).workViewPreferences.find((entry: { projectId: string }) => entry.projectId === "atlas")?.config;
    })).toMatchObject({ query: "", status: "all", preset: "all", sort: "due", group: "owner" });
    await page.reload();
    await expect(board).toHaveAttribute("aria-pressed", "true");
    await search.fill("a".repeat(180));
    await expect(board).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/layout=board/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    for (const theme of ["light", "dark"]) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      const axe = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations).toEqual([]);
    }
    await page.screenshot({ path: testInfo.outputPath(`work-filters-${locale}.png`), animations: "disabled" });
  });

  test(`mobile work cards distinguish deadlines and completed work (${locale})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.setFixedTime(new Date("2026-09-25T12:00:00Z"));
    const workspace = demoWorkspace(locale);
    const open = workspace.workItems.filter(item => item.projectId === "atlas" && !item.done);
    open[0].dueDate = "2026-09-24";
    open[0].title = "Past deadline";
    open[1].dueDate = "2026-09-25";
    open[1].title = "Today deadline";
    const done = workspace.workItems.find(item => item.projectId === "atlas" && item.done)!;
    done.dueDate = "2026-09-24";
    done.title = "Completed deadline";
    await page.addInitScript(value => localStorage.setItem("pmwork:workspace:v3", JSON.stringify(value)), workspace);
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=work`));
    const card = (title: string) => page.locator(".mobile-work-item").filter({ has: page.getByRole("button", { name: `${ru ? "Открыть детали" : "Open details"}: ${title}`, exact: true }) });
    await expect(card("Past deadline").locator(".work-card-deadline")).toContainText(ru ? "Просрочено" : "Overdue");
    await expect(card("Today deadline").locator(".work-card-deadline")).toContainText(ru ? "Сегодня" : "Due today");
    await expect(card("Completed deadline").locator(".work-card-deadline strong")).toHaveCount(0);
    await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
    const axe = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`work-deadlines-${locale}.png`), animations: "disabled" });
  });
}
