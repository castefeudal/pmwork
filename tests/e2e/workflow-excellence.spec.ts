import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { demoWorkspace } from "../../src/data/demo";
import { route } from "./support";

for (const locale of ["ru","en"] as const) for (const theme of ["light","dark"]) {
  const ru=locale==="ru";
  test(`quick task creation, details and persistence ${locale} ${theme}`,async({page},testInfo)=>{
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.addInitScript(({workspace,theme})=>{
      if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(workspace));
      localStorage.setItem("pmwork-theme",theme);
    },{workspace:demoWorkspace(locale),theme});
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=work`));
    await page.locator(".quick-work-create summary").click();
    const form=page.locator(".quick-work-create");
    await form.getByRole("textbox",{name:ru?"Название задачи":"Task title"}).fill("Acceptance evidence review");
    await form.getByRole("button",{name:ru?"Добавить задачу":"Add task",exact:true}).click();
    await expect(form.getByRole("status")).toHaveText(ru?"Задача добавлена.":"Task added.");
    const originalViewport=page.viewportSize()!;
    for(const width of [320,360,390,430,768,1024,1280,1440,1920,2560]) {
      await page.setViewportSize({width,height:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
      const controls=await form.locator("input,button").evaluateAll(elements=>elements.map(element=>({height:element.getBoundingClientRect().height,right:element.getBoundingClientRect().right})));
      expect(controls.every(control=>control.height>=44&&control.right<=width+1)).toBe(true);
    }
    await page.setViewportSize(originalViewport);
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:`test-results/quick-create-${testInfo.project.name}-${locale}-${theme}.png`,fullPage:true});
    const audit=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
    expect(audit.violations).toEqual([]);
    await form.getByRole("button",{name:ru?"Уточнить детали":"Add details"}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel(ru?"Название":"Title",{exact:true})).toHaveValue("Acceptance evidence review");
    await page.keyboard.press("Escape");
    await expect(page.locator(".workspace-top")).toContainText(ru?"Сохранено локально":"Saved locally");
    await page.reload();
    await expect(page.locator(".work-title-button:visible, .mobile-work-card:visible").filter({hasText:"Acceptance evidence review"})).toBeVisible();
  });
  test(`weekly review links to source records ${locale} ${theme}`,async({page},testInfo)=>{
    await page.clock.setFixedTime(new Date("2026-09-25T12:00:00Z"));
    const workspace=demoWorkspace(locale);
    const item=workspace.workItems.find(item=>item.projectId==="atlas")!;
    item.updatedAt="2026-09-25T10:00:00Z";
    await page.addInitScript(({workspace,theme})=>{localStorage.setItem("pmwork:workspace:v3",JSON.stringify(workspace));localStorage.setItem("pmwork-theme",theme);},{workspace,theme});
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=overview`));
    const review=page.locator(".weekly-work-review");
    await review.locator("summary").click();
    await expect(review.getByRole("button",{name:item.title,exact:true})).toBeVisible();
    await page.screenshot({path:`test-results/weekly-review-${testInfo.project.name}-${locale}-${theme}.png`,fullPage:true});
    await review.getByRole("button",{name:item.title,exact:true}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`item=${encodeURIComponent(item.id)}`));
  });
}
