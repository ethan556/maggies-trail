import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.PW_CHROMIUM_EXE;
const baseURL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3100";
const launchOptions = executablePath ? { executablePath, args: ["--no-sandbox"] } : undefined;
const playerState = /player-state\.spec\.ts/;
const playerViewport = /player-viewport\.spec\.ts/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    ...(launchOptions ? { launchOptions } : {})
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      testIgnore: [playerState, playerViewport],
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "player-state-desktop",
      testMatch: playerState,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } }
    },
    ...[
      { name: "player-phone-360", width: 360, height: 800, hasTouch: true },
      { name: "player-phone-390", width: 390, height: 844, hasTouch: true },
      { name: "player-tablet-768", width: 768, height: 1024, hasTouch: true },
      { name: "player-tablet-1024", width: 1024, height: 768, hasTouch: true },
      { name: "player-desktop-1440", width: 1440, height: 900, hasTouch: false },
      { name: "player-short-landscape", width: 844, height: 390, hasTouch: true }
    ].map(({ name, width, height, hasTouch }) => ({
      name,
      testMatch: playerViewport,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width, height },
        hasTouch
      }
    }))
  ]
});
