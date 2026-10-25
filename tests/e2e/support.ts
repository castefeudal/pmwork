export const route = (path: string) => `${process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : ""}${path}`;
import {expect,type Page} from '@playwright/test';
export async function waitForWorkspaceSection(page:Page){
 await expect(page.locator('.workspace-content')).toBeVisible();
 const loading=page.locator('.workspace-content [role="status"]').filter({hasText:/^\s*(?:Открываем раздел…|Opening section…|…)\s*$/});
 await expect(loading).toHaveCount(0);
}
export async function navigateWorkspace(page:Page,name:string){
 await expect(page.locator('.workspace-shell')).toBeVisible();
 const mobile=page.getByRole('navigation',{name:/^(Workspace|Рабочее пространство)$/});
 const board=name==='Board'||name==='Доска';
 if(board){
  let work=page.locator('.side-nav').getByRole('button',{name:/^(Work|Работа)$/}).filter({visible:true});
  if(!await work.count()) work=mobile.getByRole('button',{name:/^(Work|Работа)$/}).filter({visible:true});
  if(!await work.count()){await page.getByRole('button',{name:/^(Ещё|More)$/}).click();work=page.getByRole('dialog').getByRole('button',{name:/^(Work|Работа)$/});}
  await expect(work).toBeVisible();await work.click();
  const boardMode=page.getByRole('group',{name:/^(Work view|Представление работы)$/}).getByRole('button',{name:/^(Board|Доска)$/});await expect(boardMode).toBeVisible();await boardMode.click();await waitForWorkspaceSection(page);return;
 }
 if(name==='RAID'){
  let target=page.locator('.side-nav').getByRole('button',{name:/^(RAID|Risks & decisions|Риски и решения)$/}).filter({visible:true});
  if(!await target.count()){await page.getByRole('button',{name:/^(Ещё|More)$/}).click();target=page.getByRole('dialog').getByRole('button',{name:/^(RAID|Risks & decisions|Риски и решения)$/});}
  await expect(target).toBeVisible();await target.click();await waitForWorkspaceSection(page);return;
 }
 const aliases:Record<string,string>={'Планирование':'План','Planning':'Plan','Настройка':'Настройки','Setup':'Settings'};
 const resolved=aliases[name]??name;
 let target=page.locator('.side-nav').getByRole('button',{name:resolved,exact:true}).filter({visible:true});
 if(!await target.count()) target=mobile.getByRole('button',{name:resolved,exact:true}).filter({visible:true});
 if(!await target.count()){await page.getByRole('button',{name:/^(Ещё|More)$/}).click();target=page.getByRole('dialog').getByRole('button',{name:resolved,exact:true});}
 await expect(target).toBeVisible();await target.click();await waitForWorkspaceSection(page);
}
