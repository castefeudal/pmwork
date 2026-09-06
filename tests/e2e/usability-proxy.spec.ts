import {test,expect} from '@playwright/test';
import {demoWorkspace} from '../../src/data/demo';
import {route} from './support';
test('U5 status template has an explicit destination and editable result',async({page},info)=>{
 await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),demoWorkspace('en'));
 await page.goto(route('/en/templates/?q=status'));
 await page.getByRole('link',{name:'Status Report',exact:true}).click();
 await page.locator('.catalog-hero').getByRole('button',{name:'Use template',exact:true}).click();
 await expect(page.getByRole('dialog').getByLabel('Project',{exact:true})).toHaveValue('atlas');
 await page.getByRole('dialog').getByRole('button',{name:'Apply',exact:true}).click();
 await page.locator('.catalog-hero').getByRole('link',{name:'Open',exact:true}).click();
 await expect(page.getByRole('dialog').locator('textarea[name="body"]')).toBeVisible();
 await info.attach('automated-usability-proxy',{body:JSON.stringify({task:'U5',actions:5,friction:'Search result, detail, destination confirmation and explicit Open; no human timing.'}),contentType:'application/json'});
});
test('U6 volatile context yields an explained adaptable approach',async({page},info)=>{
 await page.goto(route('/en/tools/?tool=fit'));
 const volatility=page.getByRole('slider',{name:/Requirements volatility/});await volatility.focus();await volatility.press('End');
 await expect(volatility).toHaveValue('5');
 const result=page.getByRole('region',{name:'Calculation result',exact:true});
 await expect(result.locator(':scope > strong')).toContainText(/Flow|Hybrid|Adaptive/);
 await expect(result).toContainText('Why:');await expect(result).toContainText('Heuristic');
 await info.attach('automated-usability-proxy',{body:JSON.stringify({task:'U6',actions:2,friction:'Ten context dimensions remain available; result states heuristic limits. No human timing.'}),contentType:'application/json'});
});
test('U7 status draft opens with the critical issue and can be edited',async({page},info)=>{
 const w=demoWorkspace('en');await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),w);
 await page.goto(route('/en/workspace/?view=control'));
 await expect(page.getByText(w.issues.find(x=>x.projectId==='atlas')!.title,{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Generate status report draft',exact:true}).click();
 const body=page.getByRole('dialog').locator('textarea[name="body"]');expect(await body.inputValue()).toContain(w.issues.find(x=>x.projectId==='atlas')!.title);
 await expect(body).toBeEditable();
 await info.attach('automated-usability-proxy',{body:JSON.stringify({task:'U7',actions:2,friction:'Draft opens directly; reporting period needs editorial selection. No human timing.'}),contentType:'application/json'});
});
