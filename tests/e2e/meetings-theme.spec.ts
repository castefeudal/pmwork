import {test,expect} from "@playwright/test";
import {demoWorkspace} from "../../src/data/demo";
import {route} from "./support";

for(const locale of ["en","ru"] as const){
  test(`realized risk requires confirmation and retains source (${locale})`,async({page})=>{
    const workspace=demoWorkspace(locale),risk=workspace.risks.find(row=>row.projectId==="atlas"&&row.status!=="closed")!;
    workspace.issues=workspace.issues.filter(row=>row.relatedRiskId!==risk.id);
    await page.addInitScript(value=>{if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(value));},workspace);
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=raid&tab=risk`));
    const cell=page.getByRole("button",{name:new RegExp(`^${locale==="ru"?"Вероятность":"Probability"} ${risk.probability}, ${locale==="ru"?"влияние":"impact"} ${risk.impact}:`)});
    await cell.focus();await page.keyboard.press("Enter");await expect(cell).toHaveAttribute("aria-pressed","true");
    await page.getByRole("button",{name:locale==="ru"?"Показать все риски":"Show all risks"}).click();
    await page.getByText(locale==="ru"?"Риск наступил":"Convert risk to issue",{exact:true}).click();
    await page.getByRole("button",{name:`${risk.title} → ${locale==="ru"?"Проблема":"Issue"}`}).click();
    const dialog=page.getByRole("dialog",{name:locale==="ru"?"Зафиксировать наступивший риск?":"Record a realized risk?"});
    await dialog.getByRole("button",{name:locale==="ru"?"Отмена":"Cancel"}).click();
    expect(await page.evaluate(id=>{const raw=JSON.parse(localStorage.getItem("pmwork:workspace:v3")!);return (raw.workspace??raw).issues.some((row:{relatedRiskId?:string})=>row.relatedRiskId===id);},risk.id)).toBe(false);
    await page.getByRole("button",{name:`${risk.title} → ${locale==="ru"?"Проблема":"Issue"}`}).click();
    await dialog.getByRole("combobox",{name:locale==="ru"?"Срочность проблемы":"Issue urgency"}).selectOption("2");
    await dialog.getByRole("button",{name:locale==="ru"?"Создать проблему":"Create issue"}).click();
    await expect.poll(()=>page.evaluate(id=>{const raw=JSON.parse(localStorage.getItem("pmwork:workspace:v3")!);return (raw.workspace??raw).issues.some((row:{relatedRiskId?:string})=>row.relatedRiskId===id);},risk.id)).toBe(true);
  });
  test(`project priority can be snoozed and restored (${locale})`,async({page})=>{
    await page.addInitScript(value=>{if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(value));},demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=overview&todayScope=project`));
    const top=page.locator(".priority-focus");
    const title=await top.locator("h3").innerText();
    await top.getByRole("button",{name:locale==="ru"?"Отложить до завтра":"Snooze until tomorrow"}).click();
    await expect(page.getByRole("button",{name:locale==="ru"?"Показать снова":"Show again"})).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button",{name:locale==="ru"?"Показать снова":"Show again"})).toBeVisible();
    await page.getByRole("button",{name:locale==="ru"?"Показать снова":"Show again"}).click();
    await expect(top.locator("h3")).toHaveText(title);
  });
  test(`meeting records remain editable and durable (${locale})`,async({page})=>{
    const workspace=demoWorkspace(locale);
    workspace.meetings=[{id:"meeting-e2e",projectId:"atlas",title:"Planning review",date:"2026-11-02",attendees:["Alex"],agenda:["Agree scope"],notes:"",outputs:[]}];
    await page.addInitScript(value=>{if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(value));},workspace);
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=people&tab=meetings`));
    await page.getByRole("button",{name:locale==="ru"?"Встречи":"Meetings",exact:true}).click();
    if((page.viewportSize()?.width??0)<768) expect(await page.locator(".meeting-table").evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
    await page.getByRole("button",{name:locale==="ru"?"Изменить встречу: Planning review":"Edit meeting: Planning review"}).click();
    const dialog=page.getByRole("dialog",{name:locale==="ru"?"Изменить: встречу":"Edit meeting"});
    await dialog.getByText(locale==="ru"?"Дополнительные сведения":"More details").click();
    await dialog.getByLabel(locale==="ru"?"Итоги и следующие действия":"Outcomes and next actions").fill("Alex: share plan");
    await dialog.getByRole("button",{name:locale==="ru"?"Сохранить":"Save"}).click();
    await expect(page.getByText("Alex: share plan")).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>{const raw=JSON.parse(localStorage.getItem("pmwork:workspace:v3")??"{}");return (raw.workspace??raw).meetings?.[0]?.outputs;})).toEqual(["Alex: share plan"]);
    await page.reload(); await expect(page.getByText("Alex: share plan")).toBeVisible();
  });
  test(`theme follows system changes until explicitly selected (${locale})`,async({page})=>{
    await page.emulateMedia({colorScheme:"light"});
    await page.addInitScript(value=>{if(!localStorage.getItem("pmwork:workspace:v3"))localStorage.setItem("pmwork:workspace:v3",JSON.stringify(value));},demoWorkspace(locale));
    await page.goto(route(`/${locale}/workspace/?project=atlas&view=setup`));
    const theme=page.getByRole("combobox",{name:locale==="ru"?"Тема":"Theme",exact:true});
    await theme.selectOption("system");
    await page.emulateMedia({colorScheme:"dark"}); await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
    await theme.selectOption("light"); await expect(page.locator("html")).toHaveAttribute("data-theme","light");
    await page.emulateMedia({colorScheme:"light"}); await page.emulateMedia({colorScheme:"dark"}); await expect(page.locator("html")).toHaveAttribute("data-theme","light");
    await page.reload(); await expect(theme).toHaveValue("light");
    await page.getByRole("button",{name:locale==="ru"?"Сбросить настройки отображения":"Reset display settings"}).click();
    await expect(theme).toHaveValue("system");
    await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
    await expect(page.getByRole("combobox",{name:locale==="ru"?"Плотность интерфейса":"Interface density",exact:true})).toHaveValue("comfortable");
  });
}
