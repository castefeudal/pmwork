import { expect, test } from "@playwright/test";
import { demoWorkspace } from "../../src/data/demo";
import { route } from "./support";

const allWidths = [320, 360, 390, 768, 1024, 1366, 1440, 1920];
const representativeWidths = [320, 768, 1366, 1920];
const surfaces = [
  ["today", "view=overview"],
  ["work", "view=work"],
  ["board", "view=work&layout=board"],
  ["plan", "view=planning"],
  ["raid", "view=raid"],
  ["portfolio", "view=portfolio"],
  ["documents", "view=documents"],
] as const;

test("workspace surfaces reflow across the supported viewport matrix", async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript((workspace) => {
    localStorage.setItem("pmwork:workspace:v3", JSON.stringify(workspace));
    localStorage.setItem("pmwork-theme", "light");
  }, demoWorkspace("en"));
  for (const locale of ["ru", "en"] as const) {
    for (const [surface, query] of surfaces) {
      const widths = surface === "today" ? allWidths : representativeWidths;
      for (const width of widths) {
        await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
        await page.goto(route(`/${locale}/workspace/?project=atlas&${query}`));
        await expect(page.locator(".workspace-shell")).toBeVisible();
        await expect(page.locator(".workspace-top")).toContainText(locale === "ru" ? "Локально" : "Local");

        const report = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          const viewportOverflow = document.documentElement.scrollWidth > viewport + 1;
          const intentionalScroll = ".table-wrap, .timeline-scroll, .command-results, .portfolio-filterbar, .view-presets, .tabs, .board, .document-table";
          const outside = [...document.querySelectorAll<HTMLElement>("a,button,input,select,textarea,summary,[tabindex]")]
            .filter((element) => {
              const style = getComputedStyle(element);
              if (style.display === "none" || style.visibility === "hidden" || element.closest(intentionalScroll)) return false;
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > viewport + 1);
            })
            .slice(0, 8)
            .map((element) => `${element.tagName.toLowerCase()}.${element.className.toString().slice(0, 40)} ${JSON.stringify({left:Math.round(element.getBoundingClientRect().left),right:Math.round(element.getBoundingClientRect().right),width:Math.round(element.getBoundingClientRect().width),parent:element.parentElement?.className})}`);
          const zeroControls = [...document.querySelectorAll<HTMLElement>("a,button,input,select,textarea,summary")]
            .filter((element) => {
              const style = getComputedStyle(element);
              return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0 && element.getBoundingClientRect().width === 0;
            })
            .slice(0, 8)
            .map((element) => `${element.tagName.toLowerCase()}.${element.className.toString().slice(0, 40)} ${JSON.stringify({width:element.getBoundingClientRect().width,parent:element.parentElement?.className,html:element.outerHTML.slice(0,90)})}`);
          return { viewportOverflow, outside, zeroControls };
        });

        expect(report.viewportOverflow, `${locale} ${surface} at ${width}px has horizontal document overflow`).toBe(false);
        expect(report.outside, `${locale} ${surface} at ${width}px has controls outside the viewport`).toEqual([]);
        expect(report.zeroControls, `${locale} ${surface} at ${width}px has zero-width controls`).toEqual([]);
      }
    }
  }
});

test("first-run actions remain reachable on narrow phones and small laptops", async ({ page }) => {
  for (const locale of ["ru", "en"] as const) {
    for (const width of [320, 390, 1366]) {
      await page.setViewportSize({ width, height: width < 600 ? 740 : 720 });
      await page.goto(route(`/${locale}/workspace/`));
      await expect(page.locator(".first-run-gate")).toBeVisible();
      const bounds = await page.locator(".first-run-gate").evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
      });
      expect(bounds.left, `${locale} first run at ${width}px clips on the left`).toBeGreaterThanOrEqual(-1);
      expect(bounds.right, `${locale} first run at ${width}px clips on the right`).toBeLessThanOrEqual(width + 1);
      expect(bounds.scrollWidth, `${locale} first run at ${width}px overflows its surface`).toBeLessThanOrEqual(bounds.clientWidth + 1);
      await expect(page.getByRole("button", { name: locale === "ru" ? /готовый пример/i : /completed example/i })).toBeVisible();
    }
  }
});

for (const locale of ["ru", "en"] as const) {
  test(`${locale} command palette groups matches and remembers recent navigation`, async ({ page }) => {
    await page.addInitScript((workspace) => localStorage.setItem("pmwork:workspace:v3", JSON.stringify(workspace)), demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/`));
    await expect(page.locator(".workspace-shell")).toBeVisible();
    await page.keyboard.press("Control+k");
    const palette = page.getByRole("dialog", { name: locale === "ru" ? "Командная палитра" : "Command palette" });
    const search = palette.getByRole("combobox", { name: locale === "ru" ? "Найти запись или действие" : "Find a record or action" });
    await search.fill(locale === "ru" ? "Документы" : "Documents");
    await expect(palette.locator(".command-group-label").first()).toContainText(locale === "ru" ? "Разделы" : "Views");
    await search.press("Enter");
    await expect(palette).toHaveCount(0);

    await page.keyboard.press("Control+k");
    await expect(palette.locator(".command-group-label").first()).toHaveText(locale === "ru" ? "Недавние" : "Recent");
    await expect(palette.getByRole("option", { name: new RegExp(locale === "ru" ? "Документы" : "Documents") }).first()).toBeVisible();
  });
}

test("record editor actions stay reachable on 320px screens", async ({ page }) => {
  await page.addInitScript((workspace) => localStorage.setItem("pmwork:workspace:v3", JSON.stringify(workspace)), demoWorkspace("en"));
  for (const locale of ["ru", "en"] as const) {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(route(`/${locale}/workspace/`));
    await expect(page.locator(".workspace-shell")).toBeVisible();
    await page.keyboard.press("Control+k");
    const palette = page.getByRole("dialog", { name: locale === "ru" ? "Командная палитра" : "Command palette" });
    await palette.getByRole("option", { name: locale === "ru" ? "Создать работу" : "Create work" }).click();
    const editor = page.getByRole("dialog").last();
    const save = editor.getByRole("button", { name: locale === "ru" ? "Создать" : "Create", exact: true });
    await save.scrollIntoViewIfNeeded();
    await expect(save).toBeEnabled();
    const rect = await editor.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    });
    expect(rect.left).toBeGreaterThanOrEqual(-1);
    expect(rect.right).toBeLessThanOrEqual(321);
    expect(rect.top).toBeGreaterThanOrEqual(-1);
    expect(rect.bottom).toBeLessThanOrEqual(741);
  }
});
