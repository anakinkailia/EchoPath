import { defineConfig, devices } from "@playwright/test";
const port = Number(process.env.PLAYWRIGHT_PORT ?? 5173);
const baseURL = `http://127.0.0.1:${port}`;
const daylight = {
  cookies: [],
  origins: [
    {
      origin: baseURL,
      localStorage: [{ name: "echopath:theme", value: "light" }],
    },
  ],
};
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: baseURL,
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
