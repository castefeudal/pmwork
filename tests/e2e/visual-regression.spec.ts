import { test,expect } from '@playwright/test';
import { demoWorkspace } from '../../src/data/demo';
import { route } from './support';

// CI baselines are generated and reviewed on Linux with the pinned Playwright browser.
// Local Windows runs keep functional coverage; pixel comparison uses the CI platform.
test.skip(process.platform!=='linux','Pixel baselines use the Linux CI rendering environment');
for(const locale of ['ru','en'] as const)for(const theme of ['light','dark'])test(`visual contract ${locale} ${theme}`,async({page})=>{
  test.setTimeout(180000);
  await page.clock.setFixedTime(new Date('2026-09-25T12:00:00Z'));
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:theme as 'light'|'dark'});
  await page.addInitScript(({theme})=>localStorage.setItem('pmwork-theme',theme),{theme});
  const capture=async(name:string)=>{
    await page.evaluate(()=>document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}-${locale}-${theme}.png`,{animations:'disabled',maxDiffPixelRatio:0.005});
  };
  await page.goto(route(`/${locale}/`));await expect(page.locator('main')).toBeVisible();await capture('landing');
  await page.goto(route(`/${locale}/workspace/`));await expect(page.locator('.first-run-gate')).toBeVisible();await capture('onboarding');
  await page.evaluate(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),demoWorkspace(locale));
  for(const [name,query] of [
    ['today','view=overview'],['work','view=work'],['board','view=work&layout=board'],
    ['planning','view=planning'],['scenarios','view=planning&tab=scenarios'],['raid','view=raid'],
    ['people','view=people'],['portfolio','view=portfolio'],['finance','view=finance'],
    ['reports','view=control'],['settings','view=setup'],['documents','view=documents'],
  ]) {
    await page.goto(route(`/${locale}/workspace/?project=atlas&${query}`));
    await expect(page.locator('.workspace-shell')).toBeVisible();
    if(name==='scenarios')await expect(page.locator('.scenario-option')).toHaveCount(2);
    await expect(page.locator('.workspace-top')).toContainText(locale==='ru'?'Сохранено локально':'Saved locally');
    await capture(name);
  }
  await page.goto(route(`/${locale}/tools/`));await expect(page.locator('main')).toBeVisible();await capture('tools');
});
