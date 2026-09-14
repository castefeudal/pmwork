import { defineConfig, devices } from "@playwright/test";
// Never route the local export server through a developer/CI HTTP proxy.
const localBypass = "127.0.0.1,localhost";
process.env.NO_PROXY = [process.env.NO_PROXY, localBypass].filter(Boolean).join(",");
process.env.no_proxy = [process.env.no_proxy, localBypass].filter(Boolean).join(",");
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // Bound concurrent full-page captures to avoid memory contention.
  workers: 2,
  retries: 1,
  reporter: "list",
  use: { launchOptions: process.env.PMWORK_CHROMIUM ? { executablePath: process.env.PMWORK_CHROMIUM, args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } : {}, baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: {
    command: "node scripts/serve-export.mjs",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
