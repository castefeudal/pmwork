import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { demoWorkspace } from '../../src/data/demo';
import { navigateWorkspace, route, waitForWorkspaceSection } from './support';

test.setTimeout(180000);

for (const locale of ['ru', 'en'] as const) for (const theme of ['light', 'dark']) {
  test(`atlas finish ${locale} ${theme}: records, destinations and visual surfaces`, async ({ page }, info) => {
    test.setTimeout(180000);
    const ru = locale === 'ru';
    await page.addInitScript(({ workspace, theme }) => {
      localStorage.setItem('pmwork:workspace:v3', JSON.stringify(workspace));
      localStorage.setItem('pmwork-theme', theme);
    }, { workspace: demoWorkspace(locale), theme });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=overview`));
    await waitForWorkspaceSection(page);
    const map = page.getByRole('region', { name: ru ? 'Карта проекта' : 'Project map' });
    await expect(map).toBeVisible();
    await expect(map.getByRole('button')).toHaveCount(3);
    const fixture = demoWorkspace(locale);
    const openRisks = fixture.risks.filter(item => item.projectId === 'atlas' && item.status !== 'closed').length;
    await expect(map.getByRole('button').nth(1).locator('strong')).toHaveText(String(openRisks));
    if (info.project.name.includes('mobile')) {
      await expect(page.locator('.atlas-section-mark')).toBeHidden();
      const tops = await map.locator('.atlas-index>strong').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top));
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(2);
    }
    await page.screenshot({ path: info.outputPath('today.png'), fullPage: true });
    await page.screenshot({ path: info.outputPath('today-viewport.png') });
    await map.getByRole('button').nth(1).click();
    await expect(page).toHaveURL(/view=raid/);
    await waitForWorkspaceSection(page);
    const names = ru ? ['Работа', 'План', 'Риски и решения', 'Документы'] : ['Work', 'Plan', 'Risks & decisions', 'Documents'];
    for (const name of names) {
      await navigateWorkspace(page, name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
    }
    await navigateWorkspace(page, ru ? 'Сейчас' : 'Today');
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations;
    expect(violations).toEqual([]);
    for (const path of ['/', `/${locale}/`, `/${locale}/tools/`, `/${locale}/methods/`, `/${locale}/templates/`, `/${locale}/knowledge/`]) {
      await page.goto(route(path));
      await expect(page.locator('h1').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath(`public-${path.replaceAll('/', '-') || 'entry'}.png`), fullPage: true });
    }
  });
}
