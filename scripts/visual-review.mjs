#!/usr/bin/env node
/**
 * Visual review harness.
 *
 * Captures the workspace and public surfaces at a fixed clock and reduced
 * motion so successive runs can be compared by eye (or by diff) after a design
 * change. It seeds nothing into the app: it clicks the bundled demo project the
 * same way a first-time visitor does, so every shot reflects real rendering.
 *
 * Usage:
 *   npm run shots                       # both themes, 1440x900, RU
 *   BASE=http://localhost:3000 OUT=visual-review/2.10.0 npm run shots
 *   SIZES=1440x900,390x844 THEMES=dark LOCALES=ru,en npm run shots
 *
 * Requires a running server (npm run dev, or the static export via
 * scripts/serve-export.mjs).
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.env.OUT ?? path.join("visual-review", new Date().toISOString().slice(0, 10));
const SIZES = (process.env.SIZES ?? "1440x900").split(",").map((size) => size.split("x").map(Number));
const THEMES = (process.env.THEMES ?? "light,dark").split(",");
const LOCALES = (process.env.LOCALES ?? "ru").split(",");
const CLOCK = new Date(process.env.CLOCK ?? "2026-09-25T12:00:00Z");

const LABELS = {
  ru: { work: "Работа", plan: "План", raid: "Риски и решения", people: "Люди", finance: "Финансы", control: "Контроль", setup: "Настройки", portfolio: "Портфель", board: "Доска", example: "Посмотреть готовый пример" },
  en: { work: "Work", plan: "Plan", raid: "Risks & decisions", people: "People", finance: "Finance", control: "Control", setup: "Settings", portfolio: "Portfolio", board: "Board", example: "Explore a completed example" },
};

const VIEWS = [
  { labelKey: "work", name: "work" },
  { labelKey: "plan", name: "planning" },
  { labelKey: "raid", name: "raid" },
  { labelKey: "people", name: "people" },
  { labelKey: "finance", name: "finance" },
  { labelKey: "control", name: "control" },
  { labelKey: "portfolio", name: "portfolio" },
  { labelKey: "setup", name: "settings" },
];

mkdirSync(OUT, { recursive: true });

async function reachable(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

if (!(await reachable(`${BASE}/`))) {
  console.error(`No server at ${BASE}. Start one with "npm run dev" or "node scripts/serve-export.mjs".`);
  process.exit(1);
}

const browser = await chromium.launch();
let captured = 0;
const problems = [];

/**
 * The static export prefetches `__next.$d$locale.__PAGE__.txt` for the dynamic
 * locale segment and that file is not part of the export, so the browser
 * reports a 404 the application never depends on. Keep it out of the report,
 * but surface every other failed response with its URL.
 */
const knownExportNoise = (url) => url.includes("__next.") || url.includes("_rsc=");

for (const [width, height] of SIZES) {
  for (const theme of THEMES) {
    for (const locale of LOCALES) {
      const labels = LABELS[locale] ?? LABELS.en;
      const mobile = width < 800;
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        isMobile: mobile,
        hasTouch: mobile,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const tag = `${locale}/${theme}/${width}`;
      page.on("pageerror", (error) => problems.push(`${tag} page error: ${String(error).slice(0, 200)}`));
      page.on("response", (response) => {
        if (response.status() < 400 || knownExportNoise(response.url())) return;
        problems.push(`${tag} HTTP ${response.status()} ${response.url()}`);
      });
      await page.clock.setFixedTime(CLOCK);
      await page.addInitScript((value) => localStorage.setItem("pmwork-theme", value), theme);

      const capture = async (name, full = false) => {
        await page.evaluate(() => document.fonts.ready).catch(() => {});
        await page.waitForTimeout(350);
        await page.screenshot({
          path: path.join(OUT, `${name}-${locale}-${theme}-${width}x${height}.png`),
          fullPage: full && !mobile,
          animations: "disabled",
        });
        captured += 1;
        console.log(`shot ${name}-${locale}-${theme}-${width}x${height}.png`);
      };

      await page.goto(`${BASE}/${locale}/`, { waitUntil: "load" });
      await capture("landing");
      if (!mobile) await capture("landing-full", true);

      await page.goto(`${BASE}/${locale}/workspace/`, { waitUntil: "load" });
      await page.waitForTimeout(400);
      await capture("onboarding");
      await page.getByRole("button", { name: new RegExp(labels.example) }).first().click();
      await page.waitForTimeout(600);
      await page.locator(".workspace-shell").waitFor();
      await capture("today");

      for (const view of VIEWS) {
        if (view.name === "portfolio" && mobile) continue;
        const sideNav = page.locator(".side-nav button", { hasText: labels[view.labelKey] }).first();
        if (await sideNav.isVisible()) {
          await sideNav.click();
        } else {
          const mobileNav = page.locator(".mobile-workspace-nav button", { hasText: labels[view.labelKey] }).first();
          if (await mobileNav.count()) {
            await mobileNav.click();
          } else {
            await page.locator('.mobile-workspace-nav button[aria-haspopup="dialog"]').click();
            await page.getByRole("dialog").getByRole("button", { name: labels[view.labelKey] }).first().click();
          }
        }
        await page.waitForTimeout(450);
        await capture(view.name);
      }

      for (const route of ["tools", "knowledge"]) {
        await page.goto(`${BASE}/${locale}/${route}/`, { waitUntil: "load" });
        await capture(route);
      }

      await context.close();
    }
  }
}

await browser.close();
console.log(`\n${captured} screenshots written to ${OUT}`);
if (problems.length) {
  console.log(`\nProblems (${problems.length}):`);
  for (const entry of problems.slice(0, 10)) console.log(`  ${entry}`);
  process.exitCode = 2;
}
