import {test,expect} from '@playwright/test';
import {demoWorkspace} from '../../src/data/demo';
import {route} from './support';
for(const locale of ['ru','en'] as const)test(`milestone lifecycle persists ${locale}`,async({page})=>{
 const w=demoWorkspace(locale),m=w.milestones[0],ru=locale==='ru';
 await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),w);
 await page.goto(route(`/${locale}/workspace/?project=${m.projectId}&view=planning&item=${m.id}`));
 const d=page.getByRole('dialog');
 await d.getByLabel(ru?'Обещанная дата':'Baseline date',{exact:true}).fill('2026-09-01');
 await d.getByLabel(ru?'Текущий прогноз':'Current forecast',{exact:true}).fill('2026-09-04');
 await d.getByLabel(ru?'Фактическое завершение':'Actual completion',{exact:true}).fill('2026-09-03');
 await d.getByLabel(ru?'Статус':'Status',{exact:true}).selectOption('done');
 await d.getByRole('button',{name:ru?'Сохранить':'Save',exact:true}).click();
 await expect.poll(()=>page.evaluate(id=>{const data=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (data.workspace??data).milestones.find((x:{id:string})=>x.id===id).actualDate},m.id)).toBe('2026-09-03');
 await page.reload();await expect(page.locator('main')).toBeVisible();
});
test('v5 estimates remain observed history and new risk money round trips',async({page})=>{
 const w={...demoWorkspace('en'),schemaVersion:5},r=w.risks[0];
 await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),w);
 await page.goto(route(`/en/workspace/?project=${r.projectId}&view=raid&item=${r.id}`));
 const d=page.getByRole('dialog');await d.getByText('Advanced properties',{exact:true}).click();
 await d.getByLabel('Monetary impact',{exact:true}).fill('1000');await d.getByLabel('Monetary event probability, %',{exact:true}).fill('25');
 await d.getByRole('button',{name:'Save',exact:true}).click();
 await expect.poll(()=>page.evaluate(id=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (s.workspace??s).risks.find((x:{id:string})=>x.id===id).probabilityPercent},r.id)).toBe(25);
 const stored=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return s.workspace??s;});
 expect(stored.schemaVersion).toBe(6);expect(stored.workItems[0].estimateHistory[0].kind).toBe('imported');expect(stored.workItems[0].originalEstimate).toBeUndefined();
});

test('legacy completed milestone can be edited without inventing an actual date',async({page})=>{
 const w=demoWorkspace('en'),m=w.milestones[0];m.status='done';delete m.actualDate;
 await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify({...w,schemaVersion:5})),w);
 await page.goto(route(`/en/workspace/?project=${m.projectId}&view=planning&item=${m.id}`));
 const d=page.getByRole('dialog');await d.getByLabel('Title',{exact:true}).fill('Historical milestone');
 await d.getByRole('button',{name:'Save',exact:true}).click();await expect(d).toBeHidden();
 await expect.poll(()=>page.evaluate(id=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (s.workspace??s).milestones.find((x:{id:string})=>x.id===id).title},m.id)).toBe('Historical milestone');
 const actual=await page.evaluate(id=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (s.workspace??s).milestones.find((x:{id:string})=>x.id===id).actualDate},m.id);expect(actual||undefined).toBeUndefined();
});
