import { demoWorkspace } from "../../src/data/demo";
import { navigateWorkspace } from "./support";
import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({page}) => {
 await page.addInitScript(workspace => { if(!localStorage.getItem("pmwork:workspace:v3")) localStorage.setItem("pmwork:workspace:v3",JSON.stringify(workspace)); },demoWorkspace("en"));
});
import {route} from "./support";
test("saved views survive navigation and reload",async({page})=>{
  await page.goto(route("/en/workspace/"));
  await navigateWorkspace(page,"Work");
  await page.getByRole("button",{name:"Blocked",exact:true}).click();
  await page.getByText("Display and sorting",{exact:true}).click();
  await page.getByLabel("Sort",{exact:true}).selectOption("due");
  await page.getByLabel("List grouping",{exact:true}).selectOption("owner");
  await page.getByText("Saved views",{exact:true}).click();
  await page.getByLabel("View name").fill("Release blockers");
  await page.getByRole("button",{name:"Save view",exact:true}).click();
  await page.getByRole("button",{name:"Reset filters",exact:true}).click();
  await page.getByRole("button",{name:"Release blockers",exact:true}).click();
  await expect(page.getByRole("button",{name:"Blocked",exact:true})).toHaveAttribute("aria-pressed","true");
  await navigateWorkspace(page,"Overview");
  await navigateWorkspace(page,"Work");
  await expect(page.getByRole("button",{name:"Blocked",exact:true})).toHaveAttribute("aria-pressed","true");
  await page.waitForTimeout(650);await page.reload();
  await navigateWorkspace(page,"Work");
  await expect(page.getByRole("button",{name:"Blocked",exact:true})).toHaveAttribute("aria-pressed","true");
});
test("side editor preserves context and keyboard focus",async({page},testInfo)=>{
  await page.goto(route("/en/workspace/"));await navigateWorkspace(page,"Board");
  const title=page.getByRole("button",{name:"Align first-release scope",exact:true});await title.click();
  const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();
  await page.screenshot({path:`test-results/drawer-${testInfo.project.name}.png`,fullPage:true});
  await dialog.getByLabel("Title",{exact:true}).fill("Reviewed first-release scope");
  await dialog.getByRole("button",{name:"Save",exact:true}).click();
  await expect(page.getByRole("button",{name:"Reviewed first-release scope",exact:true})).toBeFocused();
  await page.keyboard.press("Enter");await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");await expect(dialog).toBeHidden();
});
test("palette keyboard search opens a record and creates an issue",async({page},testInfo)=>{
  await page.goto(route("/en/workspace/"));await page.getByRole("button",{name:"Open search"}).click();
  await page.getByRole("combobox",{name:"Find a record or action"}).fill("Align first-release scope");
  await page.screenshot({path:`test-results/palette-${testInfo.project.name}.png`,fullPage:true});
  await page.keyboard.press("Enter");await expect(page.getByRole("dialog",{name:"Edit work item"})).toBeVisible();
  await page.keyboard.press("Escape");await page.getByRole("button",{name:"Open search"}).click();
  await page.getByRole("combobox",{name:"Find a record or action"}).fill("Create issue");await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog",{name:"New issue"})).toBeVisible();
});
test("calculators validate without crashing and sliders support keys",async({page})=>{
  await page.goto(route("/en/tools/"));
  const slider=page.getByRole("slider").first();await slider.focus();await slider.press("ArrowLeft");await expect(slider).toHaveValue("3");
  await page.getByRole("button",{name:"Prioritization",exact:true}).click();await page.getByLabel("Effort",{exact:true}).fill("0");await expect(page.locator("main").getByRole("alert")).toContainText("Effort");
  await page.getByLabel("Effort",{exact:true}).fill("4");await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await page.getByRole("button",{name:"Earned Value",exact:true}).click();await page.getByLabel("AC",{exact:true}).fill("-1");await expect(page.locator("main").getByRole("alert")).toContainText("non-negative");
  await page.getByRole("button",{name:"Monte Carlo",exact:true}).click();await page.getByLabel("Historical weekly throughput").fill("5,wrong,7");await expect(page.locator("main").getByRole("alert")).toContainText("observations");
});
test("corrupt browser data is preserved while autosave is paused",async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,"indexedDB",{value:undefined,configurable:true});localStorage.setItem("pmwork:workspace:v3","{broken");});
  await page.goto(route("/en/workspace/"));await expect(page.locator(".recovery-banner").getByText("Autosave paused",{exact:true})).toBeVisible();await page.waitForTimeout(700);
  expect(await page.evaluate(()=>localStorage.getItem("pmwork:workspace:v3"))).toBe("{broken");
});
test("offline workspace includes its scripts and fonts",async({page,context},testInfo)=>{
  await page.goto(route("/en/workspace/"));await expect(page.getByText("Priority management actions")).toBeVisible();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.reload();await expect(page.getByRole("button",{name:"Work",exact:true}).filter({visible:true})).toBeVisible();
  await context.setOffline(true);await page.reload();await navigateWorkspace(page,"Work");await expect(page.getByRole("button",{name:"Add",exact:true})).toBeVisible();await page.getByRole("button",{name:"Open search"}).click();
  await page.getByRole("link",{name:"Tools",exact:true}).click();await expect(page.getByRole("slider").first()).toBeVisible();
  await page.goto(route("/en/"));if(testInfo.project.name.includes("mobile")) await page.getByRole("button",{name:"Open menu"}).click();
  if(!testInfo.project.name.includes("mobile")) await page.locator(".public-nav-group summary").first().click();
  await page.getByRole("link",{name:"Methods",exact:true}).filter({visible:true}).click();await expect(page.getByRole("heading",{name:"Methods library"})).toBeVisible();
  await context.setOffline(false);
});
for(const [width,height] of [[360,800],[390,844],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080]]){
  test(`workspace reflow ${width}x${height}`,async({page},testInfo)=>{
    await page.setViewportSize({width,height});await page.goto(route("/ru/workspace/"));
    for(const name of ["Обзор","Портфель","Работа","Доска","Планирование","RAID","Люди","Финансы","Контроль","Документы","Настройка"]){
      await navigateWorkspace(page,name);
      if(width===1440 || width===390) await page.screenshot({path:`test-results/visual-${testInfo.project.name}-${width}-${name}.png`,fullPage:true});
      const overflow=await page.evaluate(()=>({width:innerWidth,body:document.body.scrollWidth,elements:[...document.querySelectorAll(".workspace-top, .panel, .project-card, .section-line, .card-foot, .toolbar")].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>({class:el.className,right:el.getBoundingClientRect().right}))}));
      expect(overflow.body,JSON.stringify({name,...overflow})).toBeLessThanOrEqual(width+1);
      expect(await page.evaluate(()=>[...document.querySelectorAll('.workspace-content')].every(el=>el.getBoundingClientRect().right<=innerWidth+1)),name).toBe(true);
    }
  });
}
for(const locale of ["ru","en"] as const) for(const theme of ["light","dark"] as const){
  test(`accessibility representative surfaces ${locale} ${theme}`,async({page},testInfo)=>{
    await page.addInitScript(theme=>localStorage.setItem("pmwork-theme",theme),theme);
    await page.goto(route(`/${locale}/workspace/`));
    for(const name of (locale==="ru"?["Обзор","Работа","Доска","Планирование","RAID"]:["Overview","Work","Board","Planning","RAID"])){
      await navigateWorkspace(page,name);
      await page.screenshot({path:`test-results/theme-${testInfo.project.name}-${locale}-${theme}-${name}.png`,fullPage:true});
      const results=await new AxeBuilder({page:page as never}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
      expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),name).toEqual([]);
    }
  });
}
test("Pages navigation keeps prefix and both fonts actually load",async({page})=>{
  await page.goto(route("/ru/"));await page.evaluate(()=>document.fonts.ready);
  const fonts=await page.evaluate(()=>Array.from(document.fonts).filter(f=>f.status==="loaded").map(f=>f.family));
  expect(fonts.some(f=>/inter/i.test(f))).toBe(true);expect(fonts.some(f=>/manrope/i.test(f))).toBe(true);
  await page.getByRole("link",{name:"Открыть рабочее пространство",exact:true}).click();
  const home=page.getByRole("link",{name:"PMWORK — главная",exact:true});await expect(home).toHaveAttribute("href",route("/ru/"));
});

test("project switching and validated backup replacement",async({page})=>{
 await page.goto(route("/en/workspace/"));
 const project=page.getByRole("combobox",{name:"Select project",exact:true}).filter({visible:true});
 await project.selectOption({index:1});await page.reload();await expect(project).toHaveValue("campaign");
 await navigateWorkspace(page,"Setup");
 const downloadPromise=page.waitForEvent("download");await page.getByRole("button",{name:"Download backup",exact:true}).click();
 const download=await downloadPromise;const stream=await download.createReadStream();const chunks:Buffer[]=[];
 for await(const chunk of stream!) chunks.push(Buffer.from(chunk));const raw=Buffer.concat(chunks);const backup=JSON.parse(raw.toString());
 expect(backup.workspace.projects).toHaveLength(3);
 await page.locator('input[type="file"]').setInputFiles({name:"invalid.json",mimeType:"application/json",buffer:Buffer.from("{broken")});
 await expect(page.getByText("File did not pass validation",{exact:true})).toBeVisible();await expect(project).toHaveValue("campaign");
 page.once("dialog",dialog=>dialog.accept());
 await page.locator('input[type="file"]').setInputFiles({name:"backup.json",mimeType:"application/json",buffer:raw});
 await expect(page.getByText("Backup restored",{exact:true})).toBeVisible();
});
for(const locale of ["ru","en"]) test(`public and tool visual review ${locale}`,async({page},testInfo)=>{
 for(const path of ["","knowledge","methods","templates","tools"]){
  await page.goto(route(`/${locale}/${path?path+"/":""}`));await expect(page.locator("main")).toBeVisible();
  await page.screenshot({path:`test-results/public-${testInfo.project.name}-${locale}-${path||"landing"}.png`,fullPage:true});
  if(path === "knowledge") {
    const guide=page.locator("article").filter({has:page.getByRole("heading",{name:locale === "ru" ? "Основы" : "Fundamentals",exact:true})});
    await guide.getByRole("link",{name:locale === "ru" ? "Открыть рабочий модуль" : "Open working module"}).click();
    await expect(page.getByRole("heading",{name:locale === "ru" ? "Контроль" : "Control",exact:true})).toBeVisible();
  }
  if(path === "tools" && locale === "ru") await expect(page.locator(".result-box")).toContainText("Потоковый");
 }
 for(const name of (locale==="ru"?["Конструктор метода","Критический путь · CPM","PERT","Освоенный объём · EVM","Monte Carlo","Приоритизация","Закон Литтла"]:["Method composer","Critical Path","PERT","Earned Value","Monte Carlo","Prioritization","Little’s Law"])){
  await page.getByRole("button",{name,exact:true}).click();
  await page.screenshot({path:`test-results/tool-${testInfo.project.name}-${locale}-${name}.png`,fullPage:true});
 }
 const result=await new AxeBuilder({page:page as never}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();expect(result.violations).toEqual([]);
});
