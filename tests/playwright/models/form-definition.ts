import type { Locator, Page } from '@playwright/test';

export interface FieldDefinition {
    key: string;
    type: string;
    condition?: (data: unknown) => boolean;
    locator?: (page: Page, data?: unknown) => Locator;
}

export interface FormStep {
    stepName: string;
    fields: FieldDefinition[];

    actions?: (page: Page) => Promise<void>;
}

export interface FormFillPayload <T> {
    data: T;
    stopAfterStep?: string;
}

export interface FormDefinition<T> {
    defaults: T;
    steps: FormStep[];
    fields?: FieldDefinition[];
}