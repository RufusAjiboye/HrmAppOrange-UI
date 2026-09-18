import { expect, type Locator, type Page } from "@playwright/test";

import { Basepage } from "./base.page.js";

export class LoginPage extends Basepage {
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameField = page.getByPlaceholder("Username");
    this.passwordField = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async loginToApplication(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();

    await this.page.waitForURL(/\/dashboard\/index$/, { timeout: 15000 });
    await expect(this.page.getByRole("link", { name: /Dashboard/i })).toBeVisible({ timeout: 15000 });
  }
}
