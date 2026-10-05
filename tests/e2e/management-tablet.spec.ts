import {test,expect} from "@playwright/test";
import {demoWorkspace} from "../../src/data/demo";
import {programSchema,operationSchema} from "../../src/domain/management-entities";
import {route} from "./support";
for(const locale of ["ru","en"] as const)for(const theme of ["light","dark"] as const)test(`role surfaces retain context on tablets ${locale} ${theme}`,async({page},testInfo)=>{
 test.setTimeout(120000);
 const w=demoWorkspace(locale);w.managementRole="program";w.roleLenses=["delivery","operations"];
 w.programs=[programSchema.parse({id:"program",name:locale==="ru"?"Трансформация сервиса":"Service transformation",outcome:locale==="ru"?"Сократить ожидание":"Reduce waiting",projectIds:[w.projects[0].id]})];
 w.operations=[operationSchema.parse({id:"service",name:locale==="ru"?"Поддержка клиентов":"Customer support",purpose:locale==="ru"?"Восстановление сервиса":"Restore service"})];
 await page.clock.setFixedTime(new Date("2026-10-06T12:00:00Z"));
 await page.emulateMedia({colorScheme:theme,reducedMotion:"reduce"});
 await page.addInitScript(({w,theme})=>{if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(w));localStorage.setItem("pmwork-theme",theme);},{w,theme});
 for(const width of [768,1024])for(const view of ["program","delivery","operations"]) {
  await page.setViewportSize({width,height:900});await page.goto(route(`/${locale}/workspace/?view=${view}`));
  await expect(page.locator(".management-center")).toBeVisible();
  await expect(page.locator(".workspace-top")).toContainText(locale==="ru"?"Сохранено локально":"Saved locally");
  if(view!=="delivery")await expect(page.getByRole("heading",{name:view==="program"?w.programs[0].name:w.operations[0].name,exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(`${view}-${locale}-${theme}-${width}.png`),animations:"disabled"});
 }
});
