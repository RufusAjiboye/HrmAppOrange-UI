import { expect, type Locator, type Page } from "@playwright/test";

export class Homepage {
  private readonly page: Page;
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.getByLabel("Username");
    this.passwordField = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "LOG IN" });
  }

  async loginToApplication(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();

    await expect(this.page.getByRole("heading", { name: "Accounts Overview" })).toBeVisible();
  }

  async launchApplication() {
    await this.page.goto("/");
  }
}
