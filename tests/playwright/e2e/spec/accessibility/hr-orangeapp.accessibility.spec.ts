import { expect, test } from "@playwright/test";

import { attachAccessibilityResults, scanPageForAllIssues } from "../../../a11y/axe.js";

test.describe("Accessibility Tests for Orange HR App", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/"); // Replace with the actual URL or route
    });

    test("login page should have no automatically detected accessibility issues", async ({ page }, testInfo) => {
        await page.goto("/web/index.php/dashboard/index");
        const results = await scanPageForAllIssues(page).analyze();
        await attachAccessibilityResults(testInfo, results);

        expect(results.violations).toEqual([]); 
    });

    test("admin page should have no automatically detected accessibility issues", async ({ page }, testInfo) => {
        await page.goto("/web/index.php/admin/viewSystemUsers");
        const results = await scanPageForAllIssues(page).analyze();
        await attachAccessibilityResults(testInfo, results);

        expect(results.violations).toEqual([]); 
    });
});