import path from "node:path";
import { fileURLToPath } from "node:url";

import { devices, type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";

// Load environment variables from .env in this directory

// Recreate __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

// Resolve common project paths
const TEST_RESULTS_DIR = path.join(__dirname, "test-results");
const ALLURE_RESULTS_DIR = path.join(__dirname, "..", "allure-results");
const PLAYWRIGHT_DIR = path.join(__dirname, "playwright");
const SESSION_STORAGE_STATE_PATH = path.join(__dirname, "playwright", ".auth", "storageState.json");
const E2E_TEST_DIR = path.join(__dirname, "playwright", "e2e");

const config: PlaywrightTestConfig = {
  testDir: E2E_TEST_DIR,

  timeout: 60_000,

  expect: {
    timeout: 3_000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 2 : 3,

  outputDir: TEST_RESULTS_DIR,

  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: path.join(__dirname, "playwright-report", "results.json"),
      },
    ],
    [
      "allure-playwright",
      {
        outputFolder: ALLURE_RESULTS_DIR,
        detail: true,
        suiteTitle: false,
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? process.env.BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
    launchOptions: {
      slowMo: 5000,
    },
  },

  projects: [
    {
      name: "Auth Setup",
      testDir: PLAYWRIGHT_DIR,
      testMatch: "**/auth-setup.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    
    {
      name: "Accessibility",
      testMatch: "**/*.accessibility.spec.ts",
      timeout: 30_000,

      use: {
        ...devices["Desktop Chrome"],
        storageState: SESSION_STORAGE_STATE_PATH,
      },
      dependencies: ["Auth Setup"],
    },

    {
      name: "Sanity",
      testMatch: "**/*.sanity.spec.ts",
      timeout: 30_000,

      use: {
        ...devices["Desktop Chrome"],
        storageState: SESSION_STORAGE_STATE_PATH,
      },
      dependencies: ["Auth Setup"],
    },

    {
      name: "Login-journey-on-Chrome",
      testMatch: "**/*login*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    {
      name: "logout-sanity",
      testMatch: "**/*logout*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: SESSION_STORAGE_STATE_PATH,
      },
      dependencies: ["Auth Setup"],
    },

    {
      name: "Login-journey-on-Firefox",
      testMatch: "**/*login*.spec.ts",
      use: {
        ...devices["Desktop Firefox"],
      },
    },

    //{
      //name: "Login-journey-on-Webkit",
      //testMatch: "**/*login*.spec.ts",
      //use: {
      //  ...devices["Desktop Safari"],
      //},
    //},

    //{
      //name: "Login-journey-on-mobile-chrome",
      //testMatch: "**/*login*.spec.ts",
      //use: {
      //  ...devices["Pixel 7"],
      //},
    //},
    {
      name: "Login-journey-on-Firefox",
      testMatch: "**/*login*.spec.ts",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    
    //{
      //name: "Login-journey-on-Webkit",
      //testMatch: "**/*login*.spec.ts",
      //use: {
      //  ...devices["Desktop Safari"],
      //},
    //},

    // {
      //name: "Login-journey-on-mobile-chrome",
      //testMatch: "**/*login*.spec.ts",
      //use: {
      //  ...devices["Pixel 7"],
      //},
    //},

    //{
      //name: "mobile-safari",
      //testMatch: "**/*login*.spec.ts",
      //use: {
      //  ...devices["iPhone 15"],
      //},
    //},

    //{
      //name: "Login-journey-on-Firefox",
      //testMatch: "**/*login*.spec.ts",
      //use: {
      //  ...devices["Desktop Firefox"],
      //},
    //},
    //{
      //name: "Login-journey-on-Webkit",
      //testMatch: "**/*login*.spec.ts",
      //use: {
      //  ...devices["Desktop Safari"],
      //},
    //},
    //{
      //name: "Login-journey-on-mobile-chrome",
      //testMatch: "**/*login*.spec.ts",
      //use: {
      //  ...devices["Pixel 7"],
      //},
    //},
  ],
};
export default config;
