import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { demoWorkspace } from "../../src/data/demo";
import { route } from "./support";

for (const locale of ["ru","en"] as const) {
  test(`readable interactive preview at all supported widths (${locale})`, async ({page}, info) => {
    test.setTimeout(120000);
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.goto(route(`/${locale}/`));
    const preview=page.locator(".product-showcase");
    await expect(preview).toBeVisible();
    const tabs=page.getByRole("group",{name:locale==="ru"?"Раздел демо-проекта":"Demo project view"});
    for(const width of [320,360,390,430,768,1024,1280,1440,1920,2560]) {
      await page.setViewportSize({width,height:900});
      for(const name of locale==="ru"?["Обзор","Работа","Решения"]:["Overview","Work","Decisions"]) {
        await tabs.getByRole("button",{name,exact:true}).click();
        await page.evaluate(()=>document.fonts.ready);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
        const small=await preview.locator("*").evaluateAll(elements=>elements.filter(el=>el.getClientRects().length && Array.from(el.childNodes).some(node=>node.nodeType===3&&node.textContent?.trim()) && parseFloat(getComputedStyle(el).fontSize)<14).map(el=>`${el.className}: ${getComputedStyle(el).fontSize}`));
        expect(small).toEqual([]);
        const controls=await tabs.getByRole("button").evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));
        expect(Math.min(...controls)).toBeGreaterThanOrEqual(44);
      }
      if(width===390||width===1440)await page.screenshot({path:info.outputPath(`preview-${locale}-${width}.png`),fullPage:true});
    }
    for(const theme of ["light","dark"]) {
      await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
      const axe=await new AxeBuilder({page}).include(".product-showcase").analyze();
      expect(axe.violations).toEqual([]);
    }
  });
  test(`text preference survives reload and reflows independently of density (${locale})`,async({page})=>{
    test.setTimeout(90000);
    await page.addInitScript(w=>{if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(w));},demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=setup`));
    const select=page.getByRole("combobox",{name:locale==="ru"?"Размер текста":"Text size",exact:true});
    await select.selectOption("large");
    await page.reload();
    await expect(select).toHaveValue("large");
    expect(await page.locator("html").evaluate(el=>getComputedStyle(el).fontSize)).toBe("18px");
    for(const view of ["overview","work","program","operations","documents"]) {
      await page.goto(route(`/${locale}/workspace/?project=atlas&view=${view}`));
      for(const width of [320,768,1440]) {
        await page.setViewportSize({width,height:900});
        await page.evaluate(()=>document.fonts.ready);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${view} at ${width}`).toBeLessThanOrEqual(width+1);
      }
    }
    // A 320 CSS-pixel viewport represents reflow at 400% on a 1280px display.
    await page.setViewportSize({width:320,height:900});
    await page.evaluate(()=>document.documentElement.style.fontSize="200%");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  });
}
