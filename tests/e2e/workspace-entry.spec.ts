import {expect,test} from "@playwright/test";
import {demoWorkspace} from "../../src/data/demo";
import {route} from "./support";

test.use({serviceWorkers:"block"});
for(const locale of ["ru","en"] as const) {
  const ru=locale==="ru";
  test(`empty first entry does not create storage before a choice (${locale})`,async({page})=>{
    await page.goto(route(`/${locale}/workspace/`));
    await expect(page.getByRole("heading",{name:ru?"Создайте проект или откройте пример":"Create a project or open the example"})).toBeVisible();
    await expect(page.locator('link[data-pmwork-font-preload]')).toHaveCount(ru?4:2);
    expect(await page.evaluate(()=>localStorage.getItem("pmwork:workspace:v3"))).toBeNull();
    await expect.poll(()=>page.evaluate(async()=> (await indexedDB.databases()).some(db=>db.name==="pmwork-local"))).toBe(false);
    await page.getByRole("button",{name:new RegExp(ru?"Посмотреть готовый пример":"Explore a completed example")}).click();
    await expect(page.locator(".workspace-shell")).toBeVisible();
    await expect(page.locator(".workspace-top")).toContainText(ru?"Сохранено локально":"Saved locally");
    await page.reload();
    await expect(page.locator(".workspace-shell")).toBeVisible();
    await expect(page.locator(".priority-focus")).toBeVisible();
  });
  test(`IndexedDB-only data opens the validated workspace (${locale})`,async({page})=>{
    await page.goto(route(`/${locale}/`));
    const workspace=demoWorkspace(locale);
    workspace.projects[0].name=ru?"Сохранённый проект":"Preserved project";
    workspace.projects[0].demo=false;
    await page.evaluate(async value=>{
      localStorage.removeItem("pmwork:workspace:v3");
      await new Promise<void>((resolve,reject)=>{
        const request=indexedDB.open("pmwork-local",2);
        request.onupgradeneeded=()=>request.result.createObjectStore("workspace");
        request.onerror=()=>reject(request.error);
        request.onsuccess=()=>{
          const db=request.result,tx=db.transaction("workspace","readwrite");
          tx.objectStore("workspace").put({savedAt:Date.now(),workspace:value},"primary");
          tx.oncomplete=()=>{db.close();resolve();};
          tx.onerror=()=>{db.close();reject(tx.error);};
        };
      });
    },workspace);
    await page.goto(route(`/${locale}/workspace/`));
    await expect(page.locator(".workspace-shell")).toBeVisible();
    await expect(page.locator(".workspace-top h1")).toContainText(workspace.projects[0].name);
    await expect(page.getByRole("heading",{name:ru?"Создайте проект или откройте пример":"Create a project or open the example"})).toHaveCount(0);
  });
}
