import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test as setup } from "@playwright/test";
import { LoginPage } from "@pom/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFilePath = path.join(__dirname, ".auth", "storageState.json");
const authConfigDir = path.dirname(authFilePath);

setup("Authenticate", async ({ page }) => {
  fs.mkdirSync(authConfigDir, { recursive: true });

  const username = process.env.USERNAME ?? "";
  const password = process.env.PASSWORD ?? "";

  expect(username, "Missing USERNAME environment variable for auth setup.").toBeTruthy();
  expect(password, "Missing PASSWORD environment variable for auth setup.").toBeTruthy();

  await page.goto("/");
  await new LoginPage(page).loginToApplication(username, password);

  await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible({ timeout: 15000 });

  await page.context().storageState({
    path: authFilePath,
  });
});
