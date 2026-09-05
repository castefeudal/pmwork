import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { route,navigateWorkspace } from './support';
import { demoWorkspace } from '../../src/data/demo';
test('explicit first run, URL history, locale and independent preferences',async({page})=>{
 await page.goto(route('/en/workspace/'));
 await expect(page.getByRole('heading',{name:'Start working in PMWORK'})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('pmwork:workspace:v3'))).toBeNull();
 await page.screenshot({path:`test-results/first-run-${test.info().project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:'Explore demo'}).click();
 await navigateWorkspace(page,'Work');await expect(page).toHaveURL(/view=work/);
 await navigateWorkspace(page,'Planning');await expect(page).toHaveURL(/view=planning/);
 await page.goBack();await expect(page.getByRole('heading',{name:'Work',exact:true})).toBeVisible();
 await page.goForward();await expect(page.getByRole('heading',{name:'Planning',exact:true})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Planning',exact:true})).toBeVisible();
 await navigateWorkspace(page,'Setup');await page.getByLabel('Guidance level',{exact:true}).selectOption('advanced');await page.getByLabel('Interface density',{exact:true}).selectOption('comfortable');
 await page.getByRole('button',{name:'RU',exact:true}).click();await expect(page).toHaveURL(/ru\/workspace.*view=setup/);await expect(page.getByLabel('Уровень подсказок',{exact:true})).toHaveValue('advanced');await expect(page.getByLabel('Плотность интерфейса',{exact:true})).toHaveValue('comfortable');
});
test('glossary aliases, detail links, filter and accessibility',async({page})=>{
 await page.goto(route('/ru/glossary/'));await page.getByRole('searchbox').fill('ИСР');
 await expect(page.locator('.glossary-row')).toHaveCount(1);await page.locator('.glossary-row').click();await expect(page.getByRole('dialog')).toContainText('Work Breakdown Structure');
 await page.getByRole('link',{name:'Открыть страницу термина'}).click();await expect(page).toHaveURL(/work-breakdown-structure/);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/work-breakdown-structure/);
 await page.screenshot({path:`test-results/glossary-term-${test.info().project.name}.png`,fullPage:true});
 const results=await new AxeBuilder({page:page as never}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(results.violations).toEqual([]);
});
test('public search opens term with keyboard',async({page})=>{
 await page.goto(route('/en/'));await page.keyboard.press('Control+k');await page.getByRole('searchbox').fill('WBS');await expect(page.locator('#public-result-0')).toContainText('Work Breakdown');await page.keyboard.press('Enter');await expect(page).toHaveURL(/glossary\/work-breakdown-structure/);
});
test('clean project creation leaves demo behind',async({page})=>{
 await page.goto(route('/en/workspace/'));await page.getByRole('button',{name:'Create first project'}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Title',{exact:true}).fill('My first project');
 await dialog.getByLabel('Measurable outcome',{exact:true}).fill('Deliver the agreed pilot');
 await dialog.getByRole('button',{name:'Next',exact:true}).click();await dialog.getByRole('button',{name:'Show recommendations',exact:true}).click();await dialog.getByRole('button',{name:'Create',exact:true}).click();await expect(page.locator('.page-context').getByRole('heading',{name:'Today',exact:true})).toBeVisible();
 await expect(page.getByText('MARKOVMADE Digital Product Launch',{exact:true})).toHaveCount(0);
});
test('template destination, open and undo',async({page})=>{
 await page.goto(route('/en/workspace/'));await page.getByRole('button',{name:'Explore demo'}).click();await expect(page.locator('.workspace-shell')).toBeVisible();
 await page.goto(route('/en/templates/'));const card=page.locator('article').first();await card.getByRole('button',{name:'Use template'}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Project',{exact:true}).selectOption('campaign');await dialog.getByRole('button',{name:'Apply',exact:true}).click();
 await expect(card.getByRole('status')).toContainText('Autumn Education Campaign');await expect(card.getByRole('link',{name:'Open',exact:true})).toHaveAttribute('href',/project=campaign/);
 await card.getByRole('button',{name:'Undo',exact:true}).click();await expect(card.getByRole('status')).toHaveText('Application undone');
});
test('My work uses local member identity and editor reassignment clears it',async({page})=>{
 const workspace=demoWorkspace('en');
 workspace.projectSettings=workspace.projectSettings.map(s=>s.projectId==='atlas'?{...s,localMemberId:'TM-1'}:s);
 const original=workspace.workItems[0];
 workspace.workItems=[{...original,title:'Identity-linked work',ownerId:'TM-1',owner:'Former name',status:'ready',done:false},{...original,id:'PW-OTHER',title:'Same name, different member',ownerId:'TM-2',owner:'Anna Smirnova',status:'ready',done:false}];
 await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),workspace);
 await page.goto(route('/en/workspace/?project=atlas&view=work'));
 await page.getByRole('button',{name:'My work',exact:true}).click();
 const card=page.locator('.work-title-button,.mobile-work-card').filter({hasText:'Identity-linked work',visible:true});
 await expect(card).toBeVisible();await expect(page.getByText('Same name, different member',{exact:true})).toHaveCount(0);
 await card.click();const editor=page.getByRole('dialog');await editor.getByLabel('Owner',{exact:true}).fill('External partner');await editor.getByRole('button',{name:'Save',exact:true}).click();
 await expect(card).toHaveCount(0);
 await page.getByRole('button',{name:'All work',exact:true}).click();await expect(card).toBeVisible();
});
for(const surface of ['glossary','playbooks','knowledge','methods','templates']) test(`catalog visual evidence ${surface}`,async({page},testInfo)=>{
  await page.goto(route(`/ru/${surface}/`));await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`test-results/final-${surface}-${testInfo.project.name}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.body.scrollWidth)).toBeLessThanOrEqual((page.viewportSize()?.width??1280)+1);
  if(surface==='methods') {await page.locator('#method-comparison summary').click();await page.locator('#method-comparison input').nth(0).check();await page.locator('#method-comparison input').nth(3).check();await page.screenshot({path:`test-results/method-compare-${testInfo.project.name}.png`,fullPage:true});}
});
test('guide and More menu visual evidence',async({page},testInfo)=>{
 await page.goto(route('/ru/workspace/'));await page.getByRole('button',{name:'Посмотреть готовый пример'}).click();await navigateWorkspace(page,'Проведи меня');
 await page.screenshot({path:`test-results/guide-${testInfo.project.name}.png`,fullPage:true});
 if(testInfo.project.name.includes('mobile')){await page.getByRole('button',{name:'Ещё',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.screenshot({path:'test-results/mobile-more.png',fullPage:true});const violations=(await new AxeBuilder({page:page as never}).analyze()).violations;expect(violations).toEqual([]);await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Ещё',exact:true})).toBeFocused();}
});
