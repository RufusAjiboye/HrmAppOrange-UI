import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test as setup } from "@playwright/test";
//import { LoginPage } from "./e2e/pom/login.page.js";
import { LoginPage } from "@pom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFilePath = path.join(__dirname, ".auth", "storageState.json");
const authConfigDir = path.dirname(authFilePath);

const isAuthFileFresh = (() => {
  if (!fs.existsSync(authFilePath)) return false;

  const rawState = fs.readFileSync(authFilePath, "utf8");
  if (!rawState.trim()) return false;

  try {
    JSON.parse(rawState);
  } catch {
    return false;
  }

  const stats = fs.statSync(authFilePath);
  const fileAgeMs = Date.now() - stats.mtimeMs;
  return fileAgeMs < 60 * 60 * 1000;
})();

setup("Authenticate", async ({ page }) => {
  fs.mkdirSync(authConfigDir, { recursive: true });

  if (isAuthFileFresh) {
    console.log("Using existing authentication state.");
    return;
  }
  console.log("Authentication state is stale or missing. Re-authenticating...");

  await page.goto("/");
  await new LoginPage(page).loginToApplication(process.env.USERNAME!, process.env.PASSWORD!);

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.context().storageState({
    path: authFilePath,
  });
});
