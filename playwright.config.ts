import "dotenv/config";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: process.env.APP_URL || "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
