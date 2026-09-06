import {test,expect} from '@playwright/test';
import {route} from './support';
import {demoWorkspace} from '../../src/data/demo';
test('starter creates one linked bundle and undo survives reload',async({page})=>{
 await page.goto(route('/en/workspace/'));await page.getByRole('button',{name:/Start my project/}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Project title',{exact:true}).fill('Pilot operating model');
 await dialog.getByRole('combobox',{name:'Starter scenario',exact:true}).selectOption('digital');
 await dialog.getByRole('button',{name:'Next',exact:true}).click();await dialog.getByRole('button',{name:'Show recommendations'}).click();
 await dialog.getByRole('button',{name:'Create project and start',exact:true}).click();
 await expect(page.getByRole('button',{name:'Undo project creation'})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')??'null');return (s?.workspace??s)?.workItems?.length})).toBeGreaterThanOrEqual(3);
 await page.getByRole('button',{name:'Undo project creation'}).click();await expect(page.getByRole('button',{name:/Start my project/})).toBeVisible();
 await page.reload();await expect(page.getByRole('button',{name:/Start my project/})).toBeVisible();
 const count=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (s.workspace??s).projects.length});expect(count).toBe(0);
});
test('monetary scenario is saved with inputs and survives reload',async({page})=>{
 await page.addInitScript(w=>{if(!localStorage.getItem('pmwork:workspace:v3'))localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w))},demoWorkspace('en'));
 await page.goto(route('/en/tools/?tool=emv'));await page.getByRole('button',{name:'Choose local project'}).click();
 await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.getByRole('button',{name:'Save scenario to project'}).click();
 await expect(page.getByRole('status',{name:'Tool feedback'})).toContainText('Record saved');await page.reload();
 const document=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (s.workspace??s).documents.find((d:{type:string})=>d.type==='scenario:emv')});
 expect(document.body).toContain('"probability": 25');expect(document.body).toContain('EMV: 250');
});
test('reapplying an unchanged template reuses the draft without undoing prior work',async({page})=>{
 await page.addInitScript(w=>{if(!localStorage.getItem('pmwork:workspace:v3'))localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w))},demoWorkspace('en'));
 await page.goto(route('/en/templates/project-charter/'));
 const hero=page.locator('.catalog-hero');
 await hero.getByRole('button',{name:'Use template',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Apply',exact:true}).click();
 await expect(hero.getByRole('link',{name:'Open',exact:true})).toBeVisible();
 await hero.getByRole('button',{name:'Use template',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Apply',exact:true}).click();
 await expect(hero.getByRole('status')).toContainText('already exists');await expect(hero.getByRole('button',{name:'Undo',exact:true})).toHaveCount(0);
 const count=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (s.workspace??s).documents.filter((d:{type:string})=>d.type==='template:project-charter').length});expect(count).toBe(1);
});
