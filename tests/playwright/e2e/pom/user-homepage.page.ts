import { type Locator, type Page } from "@playwright/test";

import { Basepage } from "./base.page.js";

export class UserHomePage extends Basepage {
  private readonly profileButtonElement: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.profileButtonElement = page.locator("//img[@class='oxd-userdropdown-img']");
    this.passwordField = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async logoutFromApplication() {
    await this.selectDropdownOption(this.profileButtonElement, "Logout");
  }
}
 