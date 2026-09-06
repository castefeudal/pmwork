export const route = (path: string) => `${process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : ""}${path}`;
import {expect,type Page} from '@playwright/test';
export async function navigateWorkspace(page:Page,name:string){
 await expect(page.locator('.workspace-shell')).toBeVisible();
 const mobile=page.getByRole('navigation',{name:/^(Workspace|Рабочее пространство)$/});
 const board=name==='Board'||name==='Доска';
 if(board){
  let work=page.locator('.side-nav').getByRole('button',{name:/^(Work|Работа)$/}).filter({visible:true});
  if(!await work.count()) work=mobile.getByRole('button',{name:/^(Work|Работа)$/}).filter({visible:true});
  if(!await work.count()){await page.getByRole('button',{name:/^(Ещё|More)$/}).click();work=page.getByRole('dialog').getByRole('button',{name:/^(Work|Работа)$/});}
  await expect(work).toBeVisible();await work.click();
  const boardMode=page.getByRole('button',{name:/^(Board|Доска)$/}).filter({visible:true});await expect(boardMode).toBeVisible();await boardMode.click();return;
 }
 if(name==='RAID'){
  let target=page.locator('.side-nav').getByRole('button',{name:/^(RAID|Risks & decisions|Риски и решения)$/}).filter({visible:true});
  if(!await target.count()){await page.getByRole('button',{name:/^(Ещё|More)$/}).click();target=page.getByRole('dialog').getByRole('button',{name:/^(RAID|Risks & decisions|Риски и решения)$/});}
  await expect(target).toBeVisible();await target.click();return;
 }
 const aliases:Record<string,string>={'Планирование':'План','Planning':'Plan','Настройка':'Настройки','Setup':'Settings'};
 const resolved=aliases[name]??name;
 let target=page.locator('.side-nav').getByRole('button',{name:resolved,exact:true}).filter({visible:true});
 if(!await target.count()) target=mobile.getByRole('button',{name:resolved,exact:true}).filter({visible:true});
 if(!await target.count()){await page.getByRole('button',{name:/^(Ещё|More)$/}).click();target=page.getByRole('dialog').getByRole('button',{name:resolved,exact:true});}
 await expect(target).toBeVisible();await target.click();
}
