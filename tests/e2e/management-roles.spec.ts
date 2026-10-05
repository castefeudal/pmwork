import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {demoWorkspace,emptyWorkspace} from "../../src/data/demo";
import {programSchema,operationSchema} from "../../src/domain/management-entities";
import {route,navigateWorkspace} from "./support";

for(const locale of ["ru","en"] as const) for(const theme of ["light","dark"] as const) test.describe(`${locale} ${theme}`,()=>{
  const ru=locale==="ru";
  test.beforeEach(async({page})=>{await page.emulateMedia({colorScheme:theme});await page.addInitScript(theme=>localStorage.setItem("pmwork-theme",theme),theme);});
  test(`role personalization remains independent ${locale}`,async({page})=>{
    const w=demoWorkspace(locale);
    await page.addInitScript(w=>localStorage.setItem("pmwork:workspace:v3",JSON.stringify(w)),w);
    await page.goto(route(`/${locale}/workspace/?view=setup`));
    await page.getByLabel(ru?"Основная роль":"Primary role",{exact:true}).selectOption("delivery");
    await expect(page.locator(".workspace-shell")).toHaveClass(/experience-practitioner/);
    await expect(page.locator(".workspace-shell")).toHaveClass(/density-comfortable/);
    await navigateWorkspace(page,ru?"Поставка":"Delivery");
    await expect(page.getByText(/n=0/)).toBeVisible();
    await expect(page.locator(".management-center")).toContainText(ru?"Недостаточно данных":"Insufficient evidence");
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog",{name:ru?"Командная палитра":"Command palette"})).toBeVisible();
    await page.keyboard.press("Escape");
  });
  test(`operation without artificial project supports evidence and controls ${locale}`,async({page},testInfo)=>{
    const w=emptyWorkspace(locale);w.managementRole="operations";
    w.operations=[operationSchema.parse({id:"support",name:ru?"Поддержка клиентов":"Customer support",purpose:ru?"Восстановление сервиса":"Restore service",metrics:[{id:"response",name:ru?"Время ответа":"Response time",unit:"h",target:4,direction:"at-most"}],controls:[{id:"audit",name:ru?"Проверка очереди":"Queue check",dueDate:"2026-10-01"}]})];
    await page.clock.setFixedTime(new Date("2026-10-06T12:00:00Z"));
    await page.addInitScript(w=>{if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(w));},w);
    await page.goto(route(`/${locale}/workspace/`));
    await expect(page.getByRole("heading",{name:w.operations[0].name})).toBeVisible();
    await expect(page.locator(".management-center")).toContainText(ru?"Состояние неизвестно":"Status is unknown");
    await page.getByText(`${w.operations[0].metrics[0].name} · ≤ 4 h`,{exact:true}).click();
    await page.getByLabel(ru?"Значение":"Value",{exact:true}).fill("6");
    await page.getByRole("button",{name:ru?"Записать измерение":"Record observation"}).click();
    await expect(page.locator(".management-center")).toContainText("6 h > 4 h");
    await page.getByRole("button",{name:ru?"Отметить выполнение":"Record completion"}).click();
    await expect(page.locator(".management-center")).toContainText(ru?"Выполнено":"Completed");
    const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();expect(axe.violations).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`operations-${locale}.png`),fullPage:true});
    await expect.poll(()=>page.evaluate(()=>{const raw=JSON.parse(localStorage.getItem("pmwork:workspace:v3")!);return(raw.workspace??raw).operations[0].metrics[0].observations.length;})).toBe(1);
    await page.reload();
    await expect(page.locator(".management-center")).toContainText("6 h > 4 h");
  });
  test(`program links shared projects and explains missing benefit evidence ${locale}`,async({page},testInfo)=>{
    const w=demoWorkspace(locale);w.managementRole="program";
    w.programs=[programSchema.parse({id:"transformation",name:ru?"Трансформация сервиса":"Service transformation",outcome:ru?"Сократить время ожидания":"Reduce waiting time",projectIds:w.projects.slice(0,2).map(row=>row.id),benefits:[{id:"waiting",name:ru?"Время ожидания":"Waiting time"}]})];
    await page.addInitScript(w=>localStorage.setItem("pmwork:workspace:v3",JSON.stringify(w)),w);
    await page.goto(route(`/${locale}/workspace/?view=program&context=transformation`));
    await expect(page.getByRole("heading",{name:w.programs[0].name})).toBeVisible();
    await expect(page.getByRole("checkbox",{name:w.projects[0].name,exact:true})).toBeChecked();
    await expect(page.locator(".management-center")).toContainText(ru?"Недостаточно данных":"insufficient evidence");
    const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();expect(axe.violations).toEqual([]);
    await page.screenshot({path:testInfo.outputPath(`program-${locale}.png`),fullPage:true});
  });
});
