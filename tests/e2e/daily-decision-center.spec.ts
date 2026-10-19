import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { demoWorkspace } from '../../src/data/demo';
import { route } from './support';

for(const locale of ['ru','en'] as const) {
  const ru=locale==='ru';
  test(`enhanced contrast persists independently of theme (${locale})`,async({page},testInfo)=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(workspace=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(workspace)),demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=setup`));
    const contrast=page.getByRole('checkbox',{name:ru?'Повышенный контраст':'Enhanced contrast',exact:true});
    await contrast.check();
    await page.reload();
    await expect(contrast).toBeChecked();
    for(const theme of ['light','dark']){
      await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
      await expect(page.locator('html')).toHaveAttribute('data-contrast','more');
      const results=await new AxeBuilder({page}).analyze();
      expect(results.violations.filter(row=>row.impact==='serious'||row.impact==='critical')).toEqual([]);
      await page.screenshot({path:testInfo.outputPath(`contrast-${locale}-${theme}.png`),fullPage:true});
    }
    await contrast.uncheck();
    await expect(page.locator('html')).toHaveAttribute('data-contrast','standard');
  });
  test(`Today retains scope after reload (${locale})`,async({page})=>{
    await page.addInitScript(workspace=>{
      if(!localStorage.getItem('pmwork:workspace:v3'))localStorage.setItem('pmwork:workspace:v3',JSON.stringify(workspace));
    },demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=overview`));
    const scope=page.getByRole('group',{name:ru?'Область обзора':'Review scope'});
    await scope.getByRole('button',{name:ru?'Вся работа':'All work',exact:true}).click();
    await expect(page).toHaveURL(/todayScope=all/);
    await page.reload();
    await expect(scope.getByRole('button',{name:ru?'Вся работа':'All work',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.getByRole('group',{name:ru?'Обзор сигналов':'Signal overview'})).toBeVisible();
  });

  test(`inline scheduling keeps edits after reload (${locale})`,async({page})=>{
    await page.setViewportSize({width:1280,height:900});
    const workspace=demoWorkspace(locale),item=workspace.workItems.find(row=>row.projectId==='atlas')!;
    await page.addInitScript(workspace=>{
      if(!localStorage.getItem('pmwork:workspace:v3'))localStorage.setItem('pmwork:workspace:v3',JSON.stringify(workspace));
    },workspace);
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=work`));
    const table=page.locator('.work-table');
    const due=table.getByLabel(`${ru?'Срок':'Due date'} ${item.title}`,{exact:true});
    await due.fill('2030-06-15');
    const priority=table.getByLabel(`${ru?'Приоритет':'Priority'} ${item.title}`,{exact:true});
    await priority.selectOption('critical');
    // Navigation waits for the workspace's normal persistence cycle.
    await expect.poll(()=>page.evaluate(id=>{
      const saved=JSON.parse(localStorage.getItem('pmwork:workspace:v3')??'{}');
      return (saved.workspace??saved).workItems?.find((row:{id:string})=>row.id===id)?.priority;
    },item.id)).toBe('critical');
    await page.reload();
    await expect(due).toHaveValue('2030-06-15');
    await expect(priority).toHaveValue('critical');
  });

  test(`selected work can be archived and restored (${locale})`,async({page})=>{
    const workspace=demoWorkspace(locale),item=workspace.workItems.find(row=>row.projectId==='atlas')!;
    await page.addInitScript(workspace=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(workspace)),workspace);
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=work`));
    const search=page.getByRole('textbox',{name:ru?'Поиск работы':'Search work'});
    await search.fill(item.title);
    const checkbox=page.getByRole('checkbox',{name:`${ru?'Выбрать':'Select'} ${item.title}`,exact:true}).filter({visible:true});
    const selectionMode=page.getByRole('button',{name:ru?'Выбрать работу':'Select work',exact:true});
    if((await page.viewportSize())!.width<768){
      await page.getByText(ru?'Вид и сортировка':'Display and sorting',{exact:true}).click();
      await selectionMode.click();
    }
    await checkbox.check();
    const actions=page.getByRole('group',{name:ru?'Действия с выбранной работой':'Selected work actions'});
    await actions.getByRole('button',{name:ru?'В архив':'Archive',exact:true}).click();
    await expect(checkbox).toHaveCount(0);
    await page.getByRole('button',{name:ru?'Отменить архивацию':'Undo archive',exact:true}).click();
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();
  });

  test(`daily center fits supported widths (${locale})`,async({page},testInfo)=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(workspace=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(workspace)),demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=overview&todayScope=all`));
    await expect(page.locator('.today-signal-summary')).toBeVisible();
    for(const width of [320,360,390,430,768,1024,1280,1440,1920,2560]){
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>document.fonts.ready);
      const documentWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
      expect(documentWidth,`Document overflow at ${width}px`).toBeLessThanOrEqual(width+1);
      if(width===320||width===1440)await page.screenshot({path:testInfo.outputPath(`today-${locale}-${width}.png`),fullPage:true});
    }
  });
}
