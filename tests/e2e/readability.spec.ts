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
  test(`public controls remain reachable with 200 percent text (${locale})`,async({page})=>{
    test.setTimeout(120000);
    await page.emulateMedia({reducedMotion:"reduce"});
    for(const width of [320,1280])for(const path of ["","methods","templates","playbooks","knowledge","glossary","tools","about","privacy","sources","glossary/acceptance-criteria"]) {
      await page.setViewportSize({width,height:900});
      await page.goto(route(`/${locale}/${path?`${path}/`:""}`));
      await page.evaluate(()=>document.documentElement.style.fontSize="200%");
      await page.evaluate(()=>document.fonts.ready);
      if(width===320) {
        await page.locator(".mobile-menu").click();
        await expect(page.locator(".mobile-nav")).toBeVisible();
        await expect.poll(()=>page.evaluate(()=>document.querySelector(".mobile-nav")!.getBoundingClientRect().top-document.querySelector(".topbar")!.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(-1);
        await page.locator(".mobile-menu").click();
      }
      await page.locator(".appearance-settings>summary").click();
      const outside=await page.locator("a,button,input,select,textarea,summary").evaluateAll((elements,layoutWidth)=>elements.filter(el=>{
        if(!el.getClientRects().length||el.closest(".skip-link,.sr-only,[hidden]"))return false;
        for(let p:Element|null=el;p&&p!==document.body;p=p.parentElement) {
          if(getComputedStyle(p).visibility==="hidden"||getComputedStyle(p).display==="none")return false;
          if(p instanceof HTMLDetailsElement&&!p.open&&!p.querySelector(":scope>summary")?.contains(el))return false;
          if(p!==el&&["auto","scroll"].includes(getComputedStyle(p).overflowX))return false;
        }
        const rect=el.getBoundingClientRect();
        // Mobile WebKit may pan its visual viewport after scripted focus.
        // Check document coordinates against the requested CSS layout width.
        return rect.width>0&&rect.height>0&&(rect.left+scrollX < -1||rect.right+scrollX>layoutWidth+1);
      }).map(el=>`${el.tagName}: ${el.textContent?.trim().slice(0,40)} ${JSON.stringify({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,client:document.documentElement.clientWidth,screen:screen.width,x:scrollX,visual:visualViewport?.offsetLeft})}`),width);
      if(outside.length)await page.screenshot({path:`quality-evidence/text-200-failure-${locale}-${width}.png`});
      expect(outside,`${locale}/${path} at ${width}px with 200% text`).toEqual([]);
      const clippedText=await page.locator("main,footer").evaluateAll((roots,layoutWidth)=>{
        const clipped:string[]=[];
        for(const root of roots) {
          const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
          while(walker.nextNode()) {
            const node=walker.currentNode, el=node.parentElement;
            if(!node.textContent?.trim()||!el||el.closest("svg,script,style,.sr-only,[aria-hidden=true]"))continue;
            let skip=false;
            for(let p:Element|null=el;p&&p!==document.body;p=p.parentElement) {
              if(["auto","scroll"].includes(getComputedStyle(p).overflowX)||getComputedStyle(p).visibility==="hidden"||(p instanceof HTMLDetailsElement&&!p.open&&!p.querySelector(":scope>summary")?.contains(el))){skip=true;break;}
            }
            if(skip)continue;
            const range=document.createRange();range.selectNodeContents(node);
            if(Array.from(range.getClientRects()).some(rect=>rect.width>0&&rect.height>0&&(rect.left+scrollX < -1||rect.right+scrollX>layoutWidth+1)))clipped.push(node.textContent.trim().slice(0,70));
          }
        }
        return clipped.slice(0,20);
      },width);
      expect(clippedText,`${locale}/${path} text bounds at ${width}px`).toEqual([]);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    }
  });
  test(`text preference survives reload and reflows independently of density (${locale})`,async({page})=>{
    test.setTimeout(90000);
    await page.addInitScript(w=>{if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(w));},demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=setup`));
    const select=page.getByRole("combobox",{name:locale==="ru"?"Размер текста":"Text size",exact:true});
    await select.selectOption("large");
    await page.getByRole("combobox",{name:locale==="ru"?"Плотность интерфейса":"Interface density",exact:true}).selectOption("compact");
    await page.reload();
    await expect(page.getByRole("combobox",{name:locale==="ru"?"Плотность интерфейса":"Interface density",exact:true})).toHaveValue("compact");
    await expect(select).toHaveValue("large");
    expect(await page.locator("html").evaluate(el=>getComputedStyle(el).fontSize)).toBe("18px");
    for(const view of ["overview","work","program","operations","documents"]) {
      await page.goto(route(`/${locale}/workspace/?project=atlas&view=${view}`));
      for(const width of [320,768,1440]) {
        await page.setViewportSize({width,height:900});
        await page.evaluate(()=>document.fonts.ready);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${view} at ${width}`).toBeLessThanOrEqual(width+1);
        const small=await page.locator(".workspace-content").locator("*").evaluateAll(elements=>elements.filter(el=>!el.closest("svg")&&el.getClientRects().length&&Array.from(el.childNodes).some(node=>node.nodeType===3&&node.textContent?.trim())&&parseFloat(getComputedStyle(el).fontSize)<15.7).map(el=>`${el.className}: ${getComputedStyle(el).fontSize}`));
        expect(small).toEqual([]);
      }
    }
    // A 320 CSS-pixel viewport represents reflow at 400% on a 1280px display.
    await page.setViewportSize({width:320,height:900});
    await page.evaluate(()=>document.documentElement.style.fontSize="200%");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  });
}
