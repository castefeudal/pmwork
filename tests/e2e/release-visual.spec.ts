import {test,expect} from '@playwright/test';
import {demoWorkspace} from '../../src/data/demo';
import {route,navigateWorkspace} from './support';
for(const locale of ['ru','en'] as const)for(const theme of ['light','dark'] as const)test(`release visual surfaces ${locale} ${theme}`,async({page},info)=>{
 test.setTimeout(120000); // 25 separate routes/surfaces, each awaiting actual render readiness.
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1:3000'))errors.push(`${r.status()} ${r.url()}`)});
 await page.addInitScript(({theme,w})=>{localStorage.setItem('pmwork-theme',theme);if(!localStorage.getItem('pmwork:workspace:v3'))localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w))},{theme,w:demoWorkspace(locale)});
 const capture=async(name:string)=>{await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth+1),name).toBe(true);await page.screenshot({path:`test-results/release-${info.project.name}-${locale}-${theme}-${name}.png`,fullPage:true});};
 for(const path of ['','methods','methods/scrum','templates','templates/project-charter','playbooks','tools','glossary','glossary/critical-path','knowledge','about','privacy']){
  await page.goto(route(`/${locale}/${path}${path?'/':''}`));await expect(page.locator('main')).toBeVisible();await capture(path.replaceAll('/','-')||'landing');
 }
 await page.goto(route(`/${locale}/workspace/`));await expect(page.locator('.workspace-shell')).toBeVisible();
 for(const [en,ru] of [['Today','Сейчас'],['Guide me','Проведи меня'],['Work','Работа'],['Board','Доска'],['Plan','План'],['RAID','RAID'],['Control','Контроль'],['Finance','Финансы'],['People','Люди'],['Documents','Документы'],['Portfolio','Портфель'],['Settings','Настройки']]){
  await navigateWorkspace(page,locale==='ru'?ru:en);await capture(en.replaceAll(' ','-'));
 }
 await page.getByRole('button',{name:locale==='ru'?'Добавить':'Add',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await capture('global-add');
 expect(errors).toEqual([]);
});
