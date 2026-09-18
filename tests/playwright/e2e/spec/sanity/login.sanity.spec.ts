import { expect, test } from "@fixture/page-fixture.js";
import { LoginPage } from "@pom";

test.describe("Login Sanity Test", () => {
  test("Login is successful", async ({ loginPage, page }) => {
    await loginPage.launchApplication();
    await loginPage.loginToApplication(process.env.USERNAME!, process.env.PASSWORD!);

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});