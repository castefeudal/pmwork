export const route = (path: string) => `${process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : ""}${path}`;
import {expect,type Page} from '@playwright/test';
export async function navigateWorkspace(page:Page,name:string){
 await expect(page.locator('.workspace-shell')).toBeVisible();
 const board=name==='Board'||name==='Доска';
 if(board){await page.getByRole('button',{name:/^(Open search|Открыть поиск)$/}).click();await page.getByRole('combobox',{name:/^(Find a record or action|Найти запись или действие)$/}).fill(name);await page.keyboard.press('Enter');return;}
 let target=page.getByRole('button',{name,exact:true}).filter({visible:true});
 if(!await target.count()){
  const aliases:Record<string,string>={'Планирование':'План','Проведи меня':'Гид','Guide me':'Guide'};
  if(aliases[name])target=page.getByRole('button',{name:aliases[name],exact:true}).filter({visible:true});
 }
 if(!await target.count()){await page.getByRole('button',{name:/^(Ещё|More)$/}).click();target=page.getByRole('dialog').getByRole('button',{name,exact:true});}
 await expect(target).toBeVisible();await target.click();
}
