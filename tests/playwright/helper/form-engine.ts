import { expect, type Locator, type Page } from '@playwright/test';

import { Basepage } from '../e2e/pom/base.page.js';
import type {FieldDefinition, FormDefinition, FormFillPayload, } from '../models/form-definition.js';

/**
 * Recursively makes all properties optional, including nested object properties.
 * This allows callers to provide only the fields they want to override while
 * the form's default data supplies the remaining values.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export class FormEngine extends Basepage {
  constructor(page: Page) {
    super(page); // super call to initialize the base page with the provided Playwright page instance. Inherited the constructor of the base page class
  }

  /**
   * Fills a configured form from complete or partial data.
   *
   * Partial data is merged with the form defaults before any fields are
   * processed. Callers may also provide `stopAfterStep` to fill and execute
   * the form only through a named step.
   *
   * Each field can be conditionally skipped, resolved through its configured
   * locator, and handled as an input, select, checkbox, radio, or toggle.
   */

  async fillForm<T>(form: FormDefinition<T>, data: T): Promise<void>; // Method overload for complete form data
  async fillForm<T>(form: FormDefinition<T>, data: DeepPartial<T>): Promise<void>;
  async fillForm<T>(
    form: FormDefinition<T>,
    payload: FormFillPayload<DeepPartial<T>>,
  ): Promise<void>;
  async fillForm<T>(
    form: FormDefinition<T>,
    payload: DeepPartial<T> | FormFillPayload<DeepPartial<T>>,
  ) {
    const { data, stopAfterStep } = this.normalizeFillPayload(form, payload);

    /**
     * Processes multi-step forms in order. For each step, fields whose
     * conditions pass are populated, the optional step action is executed,
     * and processing stops when `stopAfterStep` matches the step name.
     */
    if (form.steps && form.steps.length > 0) {
      for (const step of form.steps) {
        for (const field of step.fields) {
          if (field.condition && !field.condition(data)) continue;

          const value = this.getValue(data, field.key);

          if (value === undefined || value === null) continue;

          const locator = this.resolveLocator(field, data);

          switch (field.type) {
            case 'checkbox': {
              await this.waitForFormLoaderToDisappear();
              const shouldBeChecked = this.normalizeToBoolean(value);
              await this.toggleCheckbox(locator, shouldBeChecked);
              break;
            }

            case 'radio': {
              await locator.check();
              break;
            }

            case 'toggle': {
              const shouldBeChecked = this.normalizeToBoolean(value);
              await this.handleToggle(locator, shouldBeChecked);
              break;
            }

            case 'select': {
              const expected = String(value).trim().toLowerCase();
              const current = ((await locator.textContent()) ?? '')
                .trim()
                .toLowerCase();

              if (current === expected) {
                break;
              }

              await this.selectDropdownOption(locator, String(value));
              break;
            }

            case 'input':
            default: {
              await locator.fill(String(value));
            }
          }
        }

        if (step.actions) {
          await step.actions(this.page);
          await this.page.waitForLoadState('domcontentloaded');
        }

        if (stopAfterStep && step.stepName === stopAfterStep) {
          return;
        }
      }
      return;
    }
 
    /**
     * Populates fields for a single-step form using the same conditional
     * field and control-type handling as multi-step forms.
     */
    if (form.fields && form.fields.length > 0) {
      for (const field of form.fields) {
        if (field.condition && !field.condition(data)) continue;

        const value = this.getValue(data, field.key);

        if (value === undefined || value === null) continue;

        const locator = this.resolveLocator(field, data);

        switch (field.type) {
          case 'checkbox':
          {
            await this.waitForFormLoaderToDisappear();
            const shouldBeChecked = this.normalizeToBoolean(value);
            await this.toggleCheckbox(locator, shouldBeChecked);
            break;
          }

          case 'radio': {
            await locator.check();
            break;
          }

          case 'toggle': {
            const shouldBeChecked = this.normalizeToBoolean(value);
            await this.handleToggle(locator, shouldBeChecked);
            break;
          }

          case 'select': {
            await this.selectDropdownOption(locator, String(value));
            break;
          }

          case 'input':
          default: {
            await locator.fill(String(value));
          }
        }
      }
    }
  }

  /**
   * Converts raw partial data or a payload wrapper into one complete payload.
   * Defaults are merged into either input form, and the optional stop step is
   * preserved when the caller supplies it.
   */
  private normalizeFillPayload<T>(
    form: FormDefinition<T>,
    payload: DeepPartial<T> | FormFillPayload<DeepPartial<T>>,
  ): FormFillPayload<T> {
    if (this.isFormFillPayload(payload)) {
      return {
        data: this.createFormData(form, payload.data),
        ...(payload.stopAfterStep
          ? { stopAfterStep: payload.stopAfterStep }
          : {}),
      };
    }

    return { data: this.createFormData(form, payload) };
  }

  /** Returns true when the argument is the payload wrapper rather than raw form data. */
  private isFormFillPayload<T>(
    payload: DeepPartial<T> | FormFillPayload<DeepPartial<T>>,
  ): payload is FormFillPayload<DeepPartial<T>> {
    return typeof payload === 'object' && payload !== null && 'data' in payload;
  }

  createFormData<T>(form: FormDefinition<T>, overrides?: DeepPartial<T>): T {
    return this.mergeWithDefault(form.defaults, overrides ?? {});
  }

  /** Merges nested overrides into cloned defaults without mutating the form definition. */
  private mergeWithDefault<T>(target: T, overrides: DeepPartial<T>): T {
    if (!overrides) return structuredClone(target);
    const output = structuredClone(target);

    for (const key in overrides) {
      const overrideValue = overrides[key];
      const defaultValue = output[key];

      if (
        overrideValue &&
        typeof overrideValue === 'object' &&
        !Array.isArray(overrideValue)
      ) {
        output[key] = this.mergeWithDefault(defaultValue, overrideValue);
      } else {
        output[key] = overrideValue as T[Extract<keyof T, string>];
      }
    }
    return output;
  }

  /** Reads a nested value from the completed form data using a dot-separated field key. */
  private getValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (typeof acc !== 'object' || acc === null) return undefined;

      return key in acc ? (acc as Record<string, unknown>)[key] : undefined;
    }, obj);
  }

  /** Resolves the field's configured locator and fails fast when none exists. */
  private resolveLocator(field: FieldDefinition, data: unknown): Locator {
    if (field.locator) return field.locator(this.page, data);

    throw new Error(`No locator defined for field: ${field.key}`);
  }

  /** Waits for OrangeHRM’s overlay loader to disappear before interacting with a form control. */
  private async waitForFormLoaderToDisappear(): Promise<void> {
    const loader = this.page.locator('.oxd-form-loader');

    if (await loader.count()) {
      await loader.first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => undefined);
    }
  }

  /** Handles native checkboxes and OrangeHRM switch-style controls with the same intent. */
  private async toggleCheckbox(locator: Locator, shouldBeChecked: boolean): Promise<void> {
    const nativeType = await locator.getAttribute('type');
    const elementTag = (await locator.evaluate((el) => el.tagName.toLowerCase())) ?? 'div';

    if (elementTag === 'input' && nativeType === 'checkbox') {
      const isChecked = await locator.isChecked();
      if (isChecked !== shouldBeChecked) {
        await locator.evaluate((el, checked) => {
          const input = el as HTMLInputElement;
          if (input.checked !== checked) {
            input.checked = checked;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, shouldBeChecked);
      }
      return;
    }

    const state = await locator.getAttribute('data-state');
    const className = await locator.getAttribute('class');
    const isChecked = state === 'checked' || (className ?? '').includes('oxd-switch-input--active');

    if (isChecked !== shouldBeChecked) {
      await locator.click({ position: { x: 5, y: 5 } });
    }
  }

  /** Converts booleans, `"yes"`, and other values into a control state. */
  private normalizeToBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
      return value.toLowerCase() === 'yes';
    }

    return Boolean(value);
  }

  /** Synchronizes a custom toggle's `data-state` with the requested boolean. */
  private async handleToggle(
    locator: Locator,
    shouldBeChecked: boolean,
  ) {
    await expect(locator).toBeVisible();

    const currentState = await locator.getAttribute('data-state');

    if (!currentState) {
      throw new Error("Toggle is missing the 'data-state' attribute");
    }

    const isChecked = currentState === 'checked';

    if (isChecked !== shouldBeChecked) {
      await locator.click();
    }

    await expect(locator).toHaveAttribute(
      'data-state',
      shouldBeChecked ? 'checked' : 'unchecked',
    );
  }
}
