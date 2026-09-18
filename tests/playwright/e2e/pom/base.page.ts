import type { Locator, Page } from "@playwright/test";

export abstract class Basepage {
  readonly adminMenuItem: Locator;
    readonly pinMenuItem: Locator;
    readonly recruitmentMenuItem: Locator;
    readonly myInfoMenuItem: Locator;
    readonly leaveMenuItem: Locator;
    readonly timeMenuItem: Locator;

  constructor(protected readonly page: Page) {
    this.adminMenuItem = page.getByRole("link", {name: "Admin"});
    this.pinMenuItem = page.getByRole("link", {name: "PIM"});
    this.recruitmentMenuItem = page.getByRole("link", {name: "Recruitment"});
    this.myInfoMenuItem = page.getByRole("link", {name: "My Info"});
    this.leaveMenuItem = page.getByRole("link", {name: "Leave"});
    this.timeMenuItem = page.getByRole("link", {name: "Time"});
  }

  async launchApplication() {
    await this.page.goto("/");
  }

  async selectDropdownOption(dropdown: Locator, itemToSelect: string) {
    await dropdown.click();
    const optionLocator = this.page.getByText(itemToSelect, { exact: true });
    await optionLocator.click();
  }

  async gottoAdminPage() {
        await this.adminMenuItem.click();
    }
    
    async gotoPIMPage() {
        await this.pinMenuItem.click();
    }

    async gottoPinPage() {
        await this.gotoPIMPage();
    }
    
    async gottoRecruitmentPage() {
        await this.recruitmentMenuItem.click();
    }

    async gottoMyInfoPage() {
        await this.myInfoMenuItem.click();
    }

    async gottoLeavePage() {
        await this.leaveMenuItem.click();
    }

    async gottoTimePage() {
        await this.timeMenuItem.click();
    }

}
