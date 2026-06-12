import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    env: {
      ...process.env,
      VENTUREFLOW_ENABLE_DEMO_PROJECT: "1",
    },
    url: "http://localhost:3100",
    reuseExistingServer: false,
  },
})
