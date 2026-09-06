import {test,expect} from '@playwright/test';
import {demoWorkspace} from '../../src/data/demo';
import {route} from './support';
for(const locale of ['ru','en'] as const)test(`mobile work keeps records above fold ${locale}`,async({page})=>{
 await page.setViewportSize({width:360,height:800});
 await page.addInitScript(w=>{if(!localStorage.getItem('pmwork:workspace:v3'))localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w))},demoWorkspace(locale));
 await page.goto(route(`/${locale}/workspace/?view=work`));
 const ru=locale==='ru';
 await expect(page.getByRole('button',{name:ru?'Добавить':'Add',exact:true})).toHaveCount(1);
 await expect(page.getByRole('button',{name:ru?'Добавить работу':'Add work item',exact:true})).toBeHidden();
 await expect(page.getByRole('combobox',{name:ru?'Владелец':'Owner',exact:true,includeHidden:true})).toBeHidden();
 const record=page.locator('.mobile-work-card').first();await expect(record).toBeVisible();
 expect((await record.boundingBox())!.y).toBeLessThan(600);
 await page.getByText(ru?'Вид и сортировка':'Display and sorting',{exact:true}).click();
 await expect(page.getByRole('combobox',{name:ru?'Владелец':'Owner',exact:true,includeHidden:true})).toBeVisible();
 await page.getByLabel(ru?'Статус':'Status',{exact:true}).selectOption('ready');
 await page.getByText(ru?'Вид и сортировка':'Display and sorting',{exact:true}).click();
 await page.getByRole('button',{name:ru?'Параметры пространства':'Workspace options'}).click();
 await expect(page.getByRole('dialog').getByRole('button',{name:ru?'EN':'RU',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:ru?'Параметры пространства':'Workspace options'})).toBeFocused();
 const nav=page.getByRole('navigation',{name:ru?'Рабочее пространство':'Workspace',exact:true});
 expect(await nav.getByRole('button').count()).toBe(5);
 for(const button of await nav.getByRole('button').all()){const box=await button.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);expect(box!.width).toBeGreaterThanOrEqual(44);}
});
for(const experience of ['foundation','advanced'] as const)test(`advanced fields follow experience ${experience}`,async({page})=>{
 const w={...demoWorkspace('en'),experience},risk=w.risks[0];
 await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),w);
 await page.goto(route(`/en/workspace/?view=raid&project=${risk.projectId}&item=${risk.id}`));
 const field=page.getByRole('dialog').getByLabel('Monetary impact',{exact:true});
 if(experience==='advanced')await expect(field).toBeVisible();
 else {await expect(field).toBeHidden();await page.getByText('Advanced properties',{exact:true}).click();await expect(field).toBeVisible();}
});
