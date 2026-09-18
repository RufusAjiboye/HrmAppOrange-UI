import type { AddUserSchema } from "./add-user.schema.js";
import type { FormDefinition } from "./form-definition.js";

export const addUserForm: FormDefinition<AddUserSchema> = {
    defaults: {
        addUserDetails: {
            firstName: "",
            lastName: "",
            middleName: "",
        },
        createLoginDetails: false,

        loginDetails: {
            username: "",
            status: "",
            password: "",
            confirmPassword: "",
        }
    },
    steps: [
        {
            stepName: "Add User Details",
            fields: [
                {
                    key: "addUserDetails.firstName",
                    type: "input",
                    locator: (page) => page.getByPlaceholder("First Name"),
                },

                {
                    key: "addUserDetails.lastName",
                    type: "input",
                    locator: (page) => page.getByPlaceholder("Last Name"),
                },

                {
                    key: "addUserDetails.middleName",
                    type: "input",
                    locator: (page) => page.getByPlaceholder("Middle Name"),
                },
            ],
        },

        {
            stepName: "Login Details",
            fields: [
                {
                    key: "createLoginDetails",
                    type: "checkbox",
                    locator: (page) => page.locator(".oxd-switch-wrapper label").first(),
                },
                 
                {
                    key: "loginDetails.username",
                    type: "input",
                    condition: (data) =>
                        (data as { createLoginDetails: boolean }).createLoginDetails,
                    locator: (page) => page
                        .locator("label", { hasText: /^Username$/i })
                        .locator("xpath=../following-sibling::div//input"),
                },

                {
                    key: "loginDetails.password",
                    type: "input",
                    condition: (data) =>
                        (data as { createLoginDetails: boolean }).createLoginDetails,
                    locator: (page) => page
                        .locator("label", { hasText: /^Password$/i })
                        .locator("xpath=../following-sibling::div//input"),
                },

                {
                    key: "loginDetails.status",
                    type: "radio",
                    condition: (data) =>
                        (data as { createLoginDetails: boolean }).createLoginDetails,
                    locator: (page, data) => {
                        const status = (data as { loginDetails: { status: string } })
                            .loginDetails.status;

                        return page.getByRole("radio", { name: new RegExp(`^${status}$`, "i") });
                    },
                },

                {
                    key: "loginDetails.confirmPassword",
                    type: "input",
                    condition: (data) =>
                        (data as { createLoginDetails: boolean }).createLoginDetails,
                    locator: (page) => page
                        .locator("label", { hasText: /^Confirm Password$/i })
                        .locator("xpath=../following-sibling::div//input"),
                },

            ],

            actions: async (page) => {
                await page.getByRole('button', { name: 'Save' }).click();
            }
        }
    ],
}

