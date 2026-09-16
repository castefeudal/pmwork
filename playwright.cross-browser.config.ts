import { defineConfig, devices } from "@playwright/test";

const localBypass = "127.0.0.1,localhost";
process.env.NO_PROXY = [process.env.NO_PROXY, localBypass].filter(Boolean).join(",");
process.env.no_proxy = [process.env.no_proxy, localBypass].filter(Boolean).join(",");

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "cross-browser.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
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
