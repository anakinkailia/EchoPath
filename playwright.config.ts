import { defineConfig, devices } from "@playwright/test";
const daylight = {
  cookies: [],
  origins: [
    {
      origin: "http://127.0.0.1:5173",
      localStorage: [{ name: "echopath:theme", value: "light" }],
    },
  ],
};
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:5173", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
    {
      name: "daylight-desktop",
      use: { ...devices["Desktop Chrome"], storageState: daylight },
    },
    {
      name: "daylight-mobile",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        storageState: daylight,
      },
    },
  ],
});
