import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { route } from './support';

test.setTimeout(120000);

for (const theme of ['light','dark'] as const) {
 test(`entry atlas ${theme}: responsive, accessible and immediate routes`,async({page})=>{
  await page.addInitScript(t=>localStorage.setItem('pmwork-theme',t),theme);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(route('/'));
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole('heading',{name:'PMWORK.'})).toBeVisible();
  for(const [width,height] of [[320,568],[375,667],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080],[1024,600],[568,320]]) {
   await page.setViewportSize({width,height});
   // Windows WebKit applies host DPI to its requested viewport. Test CSS pixels.
   const actual=await page.evaluate(()=>({width:innerWidth,height:innerHeight}));
   if(Math.abs(actual.width-width)>1 || Math.abs(actual.height-height)>1) {
    await page.setViewportSize({width:Math.round(width*width/actual.width),height:Math.round(height*height/actual.height)});
   }
   await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
   const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,clientWidth:document.documentElement.clientWidth}));
   expect(Math.abs(viewport.width-width)).toBeLessThanOrEqual(1);
   expect(Math.abs(viewport.height-height)).toBeLessThanOrEqual(1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.clientWidth);
   for(const selector of ['.portal-language','.portal-contact']) for(const el of await page.locator(selector).all()) {
    const box=await el.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x+box!.width).toBeLessThanOrEqual(width+1);
   }
   for(const selector of ['h1','.portal-language-copy','.portal-contact>span']) expect(await page.locator(selector).first().evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
   if(width>=1440) {
    const frame=await page.locator('.entry-portal').boundingBox();
    expect(frame!.width).toBeLessThanOrEqual(width*.85);
    const available=await page.evaluate(()=>document.documentElement.clientWidth);
    expect(Math.abs(frame!.x-(available-frame!.width)/2)).toBeLessThanOrEqual(1);
    const title=await page.locator('h1').boundingBox();
    expect(title!.height).toBeLessThanOrEqual(height*.16);
    const header=await page.locator('.portal-header').boundingBox();
    const footer=await page.locator('.portal-footer').boundingBox();
    expect(footer!.y+footer!.height-header!.y).toBeLessThanOrEqual(740);
   }
   if(width>=1440 || width===390) { const footer=await page.locator('.portal-footer').boundingBox(); expect(footer!.y+footer!.height).toBeLessThanOrEqual(height); }
   if([320,390,768,1024,1440,1920].includes(width)) await page.screenshot({path:`test-results/entry-atlas-${test.info().project.name}-${theme}-${width}x${height}.png`,fullPage:true,animations:'disabled'});
  }
  await page.setViewportSize({width:1440,height:900});
  const a11y=await new AxeBuilder({page:page as never}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(a11y.violations).toEqual([]);
  await page.setViewportSize({width:320,height:568});
  expect((await new AxeBuilder({page:page as never}).analyze()).violations).toEqual([]);
  await page.keyboard.press('Tab'); await expect(page.locator('.portal-language').first()).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.locator('.portal-language').last()).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.locator('.portal-contact')).toBeFocused();
  expect(await page.locator('.portal-heading').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  const contact=page.locator('.portal-contact');
  await expect(contact).toHaveAttribute('href','https://t.me/markovmade');
  await expect(contact).toHaveAttribute('rel','noopener noreferrer');
  // Intercept only the external destination: verify a real new-tab navigation without opening a desktop messaging app.
  await page.context().route('https://t.me/markovmade',r=>r.fulfill({status:200,contentType:'text/html',body:'<title>Telegram destination</title>'}));
  const popupPromise=page.waitForEvent('popup'); await contact.click(); const popup=await popupPromise;
  await popup.waitForLoadState(); expect(popup.url()).toBe('https://t.me/markovmade'); await popup.close();
  for(const [name,locale] of [['Русский','ru'],['English','en']]) {
   await page.goto(route('/')); await page.getByRole('link',{name:new RegExp(name)}).click(); await expect(page).toHaveURL(new RegExp(`/${locale}/$`),{timeout:15000}); await expect(page.locator('h1')).toBeVisible();
  }
 });
}
