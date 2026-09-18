import { expect, test } from "@fixture/page-fixture.js";

import type { AddUserSchema } from "../../../models/add-user.schema.js";
import { addUserForm } from "../../../models/add-user-form.js";

test.describe("Add new Employee Sanity Test", () => {
  test("Verify employee can be successfully added with their full name", async ({ page, pimPage, addEmployeePage }) => {
    
    const addEmployeeData: AddUserSchema = {
      addUserDetails: {
        firstName: "John",
        lastName: "Doe",
        middleName: "Smith",
      },
      createLoginDetails: false,
      loginDetails: {
        username: "",
        password: "",
        confirmPassword: "",
        status: "",
      },
    };

    await page.goto("/");
    await pimPage.gotoPIMPage();
    await pimPage.goToAddEmployee();

    await expect(page.getByRole("heading", { name: /Add Employee/i })).toBeVisible();
    await addEmployeePage.addNewEmployee(addUserForm, addEmployeeData);

  });
});
