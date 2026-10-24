import { defineConfig, devices } from "@playwright/test";

const localBypass = "127.0.0.1,localhost";
process.env.NO_PROXY = [process.env.NO_PROXY, localBypass].filter(Boolean).join(",");
process.env.no_proxy = [process.env.no_proxy, localBypass].filter(Boolean).join(",");

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["cross-browser.spec.ts", "management-roles.spec.ts", "risk-form-usability.spec.ts", "work-clarity.spec.ts", "daily-decision-center.spec.ts", "readability.spec.ts", "workflow-excellence.spec.ts", "planning-evidence.spec.ts", "workspace-entry.spec.ts"],
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [["list"], ["json", {outputFile:"quality-evidence/cross-browser.json"}]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    // PWA registration is covered by the dedicated Chromium test; keep UI smoke
    // checks independent from browser-specific service-worker startup races.
    serviceWorkers: "block",
    trace: "on-first-retry",
  },
  webServer: {
    command: "node scripts/serve-export.mjs",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    { name: "firefox-smoke", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-smoke", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-webkit-smoke", use: { ...devices["iPhone 15"] } },
  ],
});
