import {test,expect} from '@playwright/test';
import {route} from './support';
for(const path of ['','glossary','methods','tools','workspace'])test(`lab rendering metrics ${path||'landing'}`,async({page},testInfo)=>{
 await page.addInitScript(()=>{
  const metrics={lcp:0,cls:0};Object.assign(window,{pmworkMetrics:metrics});
  new PerformanceObserver(list=>{for(const e of list.getEntries())metrics.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries()){const shift=e as PerformanceEntry&{hadRecentInput:boolean;value:number};if(!shift.hadRecentInput)metrics.cls+=shift.value;}}).observe({type:'layout-shift',buffered:true});
 });
 await page.goto(route(`/en/${path?path+'/':''}`));await page.evaluate(()=>document.fonts.ready);await expect(page.locator('main')).toBeVisible();
 await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
 const metrics=await page.evaluate(()=>(window as unknown as {pmworkMetrics:{lcp:number;cls:number}}).pmworkMetrics);
 await testInfo.attach('local-rendering-metrics',{body:JSON.stringify({...metrics,note:'Local unthrottled lab sample, not field CWV.'}),contentType:'application/json'});
 expect(metrics.cls).toBeLessThanOrEqual(.1);
});
