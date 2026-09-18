import { expect, test } from "@fixture/page-fixture.js";

import { generateDynamicString } from "../../../helper/string-generator.js";
import type { AddUserSchema } from "../../../models/add-user.schema.js";
import { addUserForm } from "../../../models/add-user-form.js";

test.describe("Add new Employee Sanity Test", () => {
  test("Verify employee can be successfully added with their full name", async ({ page, pimPage, addEmployeePage }) => {
    const employeePostfix = generateDynamicString("emp");
    const addEmployeeData: Partial<AddUserSchema> = {
      addUserDetails: {
        firstName: `John_${employeePostfix}`,
        lastName: `Doe_${employeePostfix}`,
        middleName: `Smith_${employeePostfix}`,
      },
    };

    await page.goto("/");
    await pimPage.gotoPIMPage();
    await pimPage.goToAddEmployee();

    await expect(page.getByRole("heading", { name: /Add Employee/i })).toBeVisible({ timeout: 15_000 });
    await addEmployeePage.addNewEmployee(addUserForm, addEmployeeData);
  });

  test("Verify new employee and their user login can be successfully created", async ({ page, pimPage, addEmployeePage }) => {
    const employeePostfix = generateDynamicString("emp");
    const username = 'JJSmith';
    const password = "Secret123!";
    const addEmployeeData: Partial<AddUserSchema> = {
      addUserDetails: {
        firstName: `John_${employeePostfix}`,
        lastName: `Doe_${employeePostfix}`,
        middleName: `Smith_${employeePostfix}`,
      },
      createLoginDetails: true,
      loginDetails: {
        username: username + `_${employeePostfix}`,
        password: password,
        confirmPassword: password,
        status: "Enabled",
      }
    } 

    await page.goto("/");
    await pimPage.gotoPIMPage();
    await pimPage.goToAddEmployee();

    await expect(page.getByRole("heading", { name: /Add Employee/i })).toBeVisible({ timeout: 15_000 });
    await addEmployeePage.addNewEmployee(addUserForm, addEmployeeData);
  });
});
