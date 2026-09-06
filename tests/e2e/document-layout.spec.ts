import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {demoWorkspace} from '../../src/data/demo';
import {route} from './support';
for(const locale of ['ru','en'] as const)for(const width of [360,768,1440])test(`template document is viewport-owned ${locale} ${width}`,async({page},info)=>{
 await page.setViewportSize({width,height:900});const w=demoWorkspace(locale);w.projects[0].name=locale==='ru'?'Запуск цифрового продукта Atlas':'Atlas Digital Product Launch';
 await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),w);
 await page.goto(route(`/${locale}/templates/`));
 const card=page.locator('article.catalog-card').nth(1);await card.getByRole('link',{name:locale==='ru'?'Открыть шаблон':'Open template'}).click();
 const trigger=page.getByRole('button',{name:locale==='ru'?'Использовать':'Use template',exact:true}).first();await trigger.click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();expect(await dialog.evaluate(el=>el.parentElement?.parentElement===document.body)).toBe(true);
 await expect(dialog.getByLabel(locale==='ru'?'Проект':'Project')).toContainText('MARKOVMADE');
 await expect(dialog.locator('.document-paper h2')).toBeVisible();const box=await dialog.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width+1);expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await dialog.getByRole('button',{name:locale==='ru'?'Применить':'Apply',exact:true}).scrollIntoViewIfNeeded();await expect(dialog.getByRole('button',{name:locale==='ru'?'Применить':'Apply',exact:true})).toBeInViewport();
 await page.screenshot({path:`test-results/template-dialog-${locale}-${width}-${info.project.name}.png`});
 const axe=await new AxeBuilder({page:page as never}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
});
