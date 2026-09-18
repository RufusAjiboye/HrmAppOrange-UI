import type { Locator, Page } from "@playwright/test";

import { Basepage } from "./base.page.js";

export class PimPage extends Basepage {
  private readonly employeeListMenuItem: Locator;
  private readonly addEmployeeMenuItem: Locator;

  constructor(page: Page) {
    super(page);
    this.employeeListMenuItem = page.getByRole("link", { name: "Employee List" });
    this.addEmployeeMenuItem = page.getByRole("link", { name: "Add Employee" });
  }

  async gotoPIMPage() {
    await this.pinMenuItem.waitFor({ state: "visible" });
    await this.pinMenuItem.click();
    await this.page.getByRole("heading", { name: /PIM/i }).waitFor({ state: "visible", timeout: 15000 });
  }

  async goToEmployeePage() {
    await this.employeeListMenuItem.waitFor({ state: "visible" });
    await this.employeeListMenuItem.click();
    await this.page.getByRole("heading", { name: /Employee List/i }).waitFor({ state: "visible", timeout: 15000 });
  }

  async goToAddEmployee() {
    await this.addEmployeeMenuItem.waitFor({ state: "visible" });
    await this.addEmployeeMenuItem.click();
    await this.page.getByRole("heading", { name: /Add Employee/i }).waitFor({ state: "visible", timeout: 15000 });
  }
}