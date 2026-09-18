import { type BrowserContext, test as base } from "@playwright/test";
import {
    AddEmployeePage,
    LoginPage,
    PimPage,
    UserHomePage,
} from "@pom";

import { FormEngine } from "../../helper/form-engine.js";

type BrowserContextFixture = {
    freshBrowser: BrowserContext;
}

type PageFixture = BrowserContextFixture & {
    loginPage: LoginPage;
    userHomePage: UserHomePage;
    addEmployeePage: AddEmployeePage;   
    pimPage: PimPage;
    formEngine: FormEngine;
};

export const test = base.extend<PageFixture>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    freshBrowser: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: {
                cookies: [],
                origins: [],
            },
            ...(process.env.BASE_URL ? { baseURL: process.env.BASE_URL } : {}),
            ignoreHTTPSErrors: true,
         });
        await use(context);
        await context.close();
    },

    userHomePage: async ({ page }, use) => {
        const userHomePage = new UserHomePage(page);
        await use(userHomePage);
    },
    pimPage: async ({ page }, use) => {
        const pimPage = new PimPage(page);
        await use(pimPage);
    },

    addEmployeePage: async ({ page }, use) => {
        const addEmployeePage = new AddEmployeePage(page);
        await use(addEmployeePage);
    },

    formEngine: async ({ page }, use) => {
        const formEngine = new FormEngine(page);
        await use(formEngine);
    }
    
});

export { expect } from "@playwright/test";