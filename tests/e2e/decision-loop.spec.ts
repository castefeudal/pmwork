import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {demoWorkspace} from '../../src/data/demo';
import {route} from './support';

for(const locale of ['ru','en'] as const) test(`signal evidence and contextual record link ${locale}`,async({page})=>{
  const w=demoWorkspace(locale);
  await page.clock.setFixedTime(new Date('2026-09-25T12:00:00Z'));
  await page.addInitScript(w=>{if(!localStorage.getItem('pmwork:workspace:v3'))localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w));},w);
  await page.goto(route(`/${locale}/workspace/?project=atlas&view=overview`));
  const top=page.locator('.priority-focus');
  await top.getByText(locale==='ru'?'Основание и качество данных':'Evidence and data quality',{exact:true}).click();
  await expect(top.locator('.signal-evidence')).toContainText('2026-09-25');
  await top.getByRole('button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/item=.+&kind=/);
  const url=page.url();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goForward();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).not.toHaveURL(/item=/);
  await page.goto(url);
  await expect(page.getByRole('dialog')).toBeVisible();
});

for(const locale of ['ru','en'] as const) test(`schedule comparison requires approval and supports undo ${locale}`,async({page})=>{
  const w=demoWorkspace(locale);
  await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),w);
  await page.goto(route(`/${locale}/workspace/?project=atlas&view=planning&tab=scenarios`));
  await expect(page.locator('.scenario-option')).toHaveCount(2);
  const shift=page.getByRole('spinbutton',{name:locale==='ru'?'Сдвиг, календарных дней':'Shift, calendar days'}).first();
  await shift.fill('4000');
  await expect(page.getByRole('alert')).toBeVisible();
  await shift.fill('-7');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await shift.fill('7');
  await page.getByRole('button',{name:locale==='ru'?'Просмотреть изменения A':'Review changes A',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.locator('.scenario-diff')).toContainText('⇒');
  const axe=await new AxeBuilder({page:page as never}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
  const dates=()=>page.evaluate(()=>{const raw=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (raw.workspace??raw).workItems.map((x:{startDate?:string;dueDate?:string})=>[x.startDate??null,x.dueDate??null]);});
  const original=w.workItems.map(x=>[x.startDate??null,x.dueDate??null]);
  expect(await dates()).toEqual(original);
  await dialog.getByRole('button',{name:locale==='ru'?'Применить показанные изменения':'Apply reviewed changes',exact:true}).click();
  await expect.poll(dates).not.toEqual(original);
  await page.getByRole('button',{name:locale==='ru'?'Отменить последний сценарий':'Undo last scenario',exact:true}).click();
  await expect.poll(dates).toEqual(original);
});

test('board transitions append the same durable evidence as list transitions',async({page})=>{
  const w=demoWorkspace('en'),item=w.workItems.find(x=>x.projectId==='atlas'&&x.status==='ready')!;
  await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),w);
  await page.goto(route('/en/workspace/?project=atlas&view=work&layout=board'));
  await page.locator('.work-card').filter({has:page.getByRole('button',{name:item.title,exact:true})}).getByRole('button',{name:'Move right'}).click();
  await expect.poll(()=>page.evaluate(id=>{const raw=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (raw.workspace??raw).workItems.find((x:{id:string})=>x.id===id).statusHistory?.at(-1)?.to;},item.id)).toBe('in-progress');
});

test('missing forecast remains unknown in finance',async({page})=>{
  const w=demoWorkspace('en');w.budgets.filter(x=>x.projectId==='atlas').forEach(x=>{delete x.forecast;});
  await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),w);
  await page.goto(route('/en/workspace/?project=atlas&view=finance'));
  await expect(page.getByText('Forecast evidence is incomplete')).toBeVisible();
  await expect(page.locator('.notice')).toContainText('Forecast is missing');
});
