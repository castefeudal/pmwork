import {test,expect} from '@playwright/test';
import {route} from './support';
import {demoWorkspace} from '../../src/data/demo';
for(const surface of ['','glossary','methods','tools','workspace','workspace-loaded'])test(`lab rendering metrics ${surface||'landing'}`,async({page},testInfo)=>{
 const path=surface==='workspace-loaded'?'workspace':surface;
 if(surface==='workspace-loaded')await page.addInitScript(w=>localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w)),demoWorkspace('en'));
 await page.addInitScript(()=>{
  const metrics={lcp:0,cls:0};Object.assign(window,{pmworkMetrics:metrics});
  new PerformanceObserver(list=>{for(const e of list.getEntries())metrics.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries()){const shift=e as PerformanceEntry&{hadRecentInput:boolean;value:number};if(!shift.hadRecentInput)metrics.cls+=shift.value;}}).observe({type:'layout-shift',buffered:true});
 });
 await page.goto(route(`/en/${path?path+'/':''}`));await page.evaluate(()=>document.fonts.ready);await expect(page.locator('main')).toBeVisible();
 if(surface==='workspace-loaded')await expect(page.locator('.workspace-shell')).toBeVisible();
 else if(surface==='workspace')await expect(page.getByRole('button',{name:/Start my project/})).toBeVisible();
 await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
 const metrics=await page.evaluate(()=>(window as unknown as {pmworkMetrics:{lcp:number;cls:number}}).pmworkMetrics);
 await testInfo.attach('local-rendering-metrics',{body:JSON.stringify({...metrics,note:'Local unthrottled lab sample, not field CWV.'}),contentType:'application/json'});
 expect(metrics.cls).toBeLessThanOrEqual(.1);
});
