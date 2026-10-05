import { test,expect } from '@playwright/test';
import { demoWorkspace } from '../../src/data/demo';
import { programSchema, operationSchema } from '../../src/domain/management-entities';
import { route } from './support';

// CI baselines are generated and reviewed on Linux with the pinned Playwright browser.
// Local Windows runs keep functional coverage; pixel comparison uses the CI platform.
test.skip(process.platform!=='linux','Pixel baselines use the Linux CI rendering environment');
// A service worker can serve CSS without page.route seeing it on later navigations.
// Offline/cache behavior is covered by the functional suite, not pixel fixtures.
test.use({serviceWorkers:'block'});
for(const locale of ['ru','en'] as const)for(const theme of ['light','dark'])test(`visual contract ${locale} ${theme}`,async({page})=>{
  test.setTimeout(180000);
  // Production deliberately permits a permanent fallback on slow font loads.
  // Pixel references compare the loaded bundled faces, not optional-font timing.
  // Keep the same font files/metrics; normalize only the loading policy in this fixture.
  await page.route('**/*.css',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace(/font-display:\s*optional/g,'font-display:block')});
  });
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
  const roles=demoWorkspace(locale);
  roles.managementRole='program';roles.roleLenses=['delivery','operations'];
  roles.programs=[programSchema.parse({id:'service-program',name:locale==='ru'?'Трансформация сервиса':'Service transformation',outcome:locale==='ru'?'Сократить время ожидания':'Reduce waiting time',projectIds:roles.projects.slice(0,2).map(project=>project.id),benefits:[{id:'waiting',name:locale==='ru'?'Время ожидания':'Waiting time'}]})];
  roles.operations=[operationSchema.parse({id:'support',name:locale==='ru'?'Поддержка клиентов':'Customer support',purpose:locale==='ru'?'Восстановление сервиса':'Restore service',metrics:[{id:'response',name:locale==='ru'?'Время ответа':'Response time',unit:'h',target:4,direction:'at-most',observations:[{at:'2026-09-24',value:6}]}],controls:[{id:'queue',name:locale==='ru'?'Проверка очереди':'Queue check',dueDate:'2026-09-24'}]})];
  // Seed both storage layers consistently. An older IDB envelope otherwise wins
  // over an undated localStorage fixture and hides the very role records under review.
  await page.evaluate(async w=>{
    await new Promise<void>((resolve,reject)=>{const request=indexedDB.deleteDatabase('pmwork-local');request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Fixture database remains open'));});
    localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w));
  },roles);
  for(const view of ['program','delivery','operations']) {
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=${view}`));
    await expect(page.locator('.management-center')).toBeVisible();
    if(view==='program'||view==='operations')await expect(page.getByRole('heading',{name:view==='program'?roles.programs[0].name:roles.operations[0].name,exact:true})).toBeVisible();
    await expect(page.locator('.workspace-top')).toContainText(locale==='ru'?'Сохранено локально':'Saved locally');
    await capture(view);
  }
});
