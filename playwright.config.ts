import { defineConfig } from "@playwright/test";

const FE_BASE_URL = process.env.FE_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
const IS_HEADLESS = /^true$/i.test(process.env.PW_HEADLESS ?? "false");

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 600_000,
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: FE_BASE_URL,
    headless: IS_HEADLESS,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: "npx vite --host 127.0.0.1 --port 5173",
    url: FE_BASE_URL,
    timeout: 120_000,
    reuseExistingServer: true,
    env: {
      VITE_API_BASE_URL: `${API_BASE_URL.replace(/\/$/, "")}/api`,
    },
  },
});
