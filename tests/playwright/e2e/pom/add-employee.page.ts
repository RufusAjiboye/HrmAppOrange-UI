import type { Locator, Page } from '@playwright/test';
import type { FormDefinition } from 'tests/playwright/models/form-definition.js';

import { FormEngine } from '../../helper/form-engine.js';
import { Basepage } from './base.page.js';

export class AddEmployeePage extends Basepage {
    private readonly employeeMenuList: Locator;
    private readonly addEmployeeMenuList: Locator;

    constructor(page: Page) {
        super(page); // Initialize the base page with the provided Playwright page instance.
        this.employeeMenuList = page.getByRole("link", { name: "Employee" });
        this.addEmployeeMenuList = page.getByRole("link", { name: "Add Employee" });
    }

    async addNewEmployee<T extends object>(form: FormDefinition<T>, data: T) {
        const firstNameField = this.page.getByPlaceholder("First Name");
        await firstNameField.waitFor({ state: "visible", timeout: 15000 });

        const formEngine = new FormEngine(this.page);
        await formEngine.fillForm(form, data);
    }
}