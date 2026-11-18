import assert from "node:assert/strict";
import { chromium, firefox, webkit } from "@playwright/test";

const origin = 'http://127.0.0.1:4182';
const base = process.env.PMWORK_BASE_PATH === 'github' ? '/pmwork' : '';
const url = path => origin + base + path;
const sizes = [[1440, 900], [820, 1180], [390, 844]];

async function imageReady(locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate(img => img.decode());
  assert(await locator.evaluate(img => img.naturalWidth > 0));
}

for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch({ timeout:60000 });
  try {
    for (const theme of ['light', 'dark']) {
      const matrix = name === 'chromium' ? sizes : [sizes[0], sizes[2]];
      for (const [width, height] of matrix) {
        const context = await browser.newContext({
          viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce'
        });
        await context.addInitScript(theme => localStorage.setItem('pmwork-theme', theme), theme);
        const page = await context.newPage();
        const locale = theme === 'light' ? 'en' : 'ru';
        async function open(path) {
          const response = await page.goto(url(path));
          assert.equal(response?.status(), 200);
          await page.evaluate(() => document.fonts.ready);
          assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
        }
        async function shot(label, fullPage = false) {
          if (name === 'chromium') await page.screenshot({
            path: `test-results/art-${label}-${theme}-${width}.png`, animations: 'disabled', fullPage
          });
        }
        await open('/');
        const entry = page.locator('.portal-backdrop img');
        await imageReady(entry);
        assert.equal(await entry.evaluate(img => new URL(img.currentSrc).pathname), base + (width < 768 ? '/visuals/atlas/entry-mobile.webp' : '/visuals/atlas/entry.webp'));
        await shot('entry');
        await page.getByRole('link', { name: locale === 'ru' ? /Русский/ : /English/ }).click();
        await page.waitForURL(url(`/${locale}/`));
        await open(`/${locale}/`);
        const hero = page.locator('.hero-aurora img');
        await imageReady(hero);
        assert.equal(await hero.evaluate(img => new URL(img.currentSrc).pathname), base + (width < 768 ? '/visuals/atlas/hero-mobile.webp' : '/visuals/atlas/hero.webp'));
        await shot('hero');
        for (const tab of await page.locator('.role-showcase button[data-role]').all()) {
          const role = await tab.getAttribute('data-role');
          await tab.click();
          await page.locator(`.role-showcase-plate[data-role-view=${role}]:not([hidden])`).waitFor();
          const roleImage = page.locator('.role-showcase-plate:not([hidden]) img');
          await imageReady(roleImage);
        }
        for (const plate of await page.locator('.capability-atlas-image, .closing-field').all()) await imageReady(plate);
        await page.evaluate(() => scrollTo(0,0));
        await shot('landing', true);
        await open(`/${locale}/knowledge/`);
        await imageReady(page.locator('.catalog-atlas-image'));
        await shot('knowledge');
        await open(`/${locale}/workspace/`);
        await imageReady(page.locator('.first-run-plate-image'));
        await shot('onboarding', true);
        if (name === 'chromium' && width === 390) {
          await page.waitForFunction(() => navigator.serviceWorker.controller, undefined, { timeout: 60000 });
          const urls = await page.evaluate(async () => {
            const keys = await caches.keys();
            const cache = await caches.open(keys.find(key => key.startsWith('pmwork-')));
            return (await cache.keys()).map(request => new URL(request.url).pathname);
          });
          assert(urls.includes(base + '/visuals/atlas/entry-mobile.webp'));
          assert(urls.includes(base + '/visuals/sections/convergence.webp'));
          assert(!urls.some(path => path.includes('/visuals/social/')));
          await context.setOffline(true);
          await open(`/${locale}/`);
          await imageReady(page.locator('.hero-aurora img'));
        }
        console.log(name, theme, width, 'artwork and roles OK');
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
