import { expect, test } from "@playwright/test";
import { LoginPage, UserHomePage } from "@pom";

test.describe("Logout Sanity Test", () => {
  test("Logout is successful", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await new UserHomePage(page).logoutFromApplication();

    await expect(page.getByText("Forgot your password? ", { exact: true })).toBeVisible();
  });
});
