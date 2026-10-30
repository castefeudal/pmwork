import { expect, test } from "@playwright/test";
import { demoWorkspace } from "../../src/data/demo";
import { route, waitForWorkspaceSection } from "./support";

test.use({ serviceWorkers: "block" });

for (const locale of ["ru", "en"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`UX screenshot matrix ${locale} ${theme} (390, 768, 1440)`, async ({ browser }, info) => {
      test.setTimeout(180000);
      const sections = [
        ["today", "view=overview"],
        ["work", "view=work"],
        ["documents", "view=documents"],
        ["planning", "view=planning"],
        ["raid", "view=raid"],
      ] as const;

      for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          reducedMotion: "reduce",
          serviceWorkers: "block",
          baseURL: "http://127.0.0.1:3000",
        });
        await context.addInitScript(value => localStorage.setItem("pmwork-theme", value), theme);
        const page = await context.newPage();
        await page.goto(route(`/${locale}/workspace/`));
        await page.locator('.first-run-gate[aria-busy="false"]').waitFor({ state: "visible" });
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator(".first-run-actions")).toBeVisible();
        if (width === 390) {
          const [actions, illustration] = await Promise.all([
            page.locator(".first-run-actions").boundingBox(),
            page.locator(".first-run-plate").boundingBox(),
          ]);
          expect(actions).not.toBeNull();
          expect(illustration).not.toBeNull();
          expect(actions!.y + actions!.height).toBeLessThan(illustration!.y);
        }
        await page.screenshot({ path: info.outputPath(`ux-${width}-onboarding-${locale}-${theme}.png`), animations: "disabled" });

        await page.locator(".first-run-actions button").nth(1).click();
        await waitForWorkspaceSection(page);
        for (const [name, query] of sections) {
          await page.goto(route(`/${locale}/workspace/?project=atlas&${query}`));
          await waitForWorkspaceSection(page);
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({ path: info.outputPath(`ux-${width}-${name}-${locale}-${theme}.png`), animations: "disabled" });
        }
        await context.close();
      }
    });
  }
}
