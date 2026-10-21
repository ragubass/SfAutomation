import { expect } from '@playwright/test';

export class SignupPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: /email address/i });
    this.termsCheckbox = page.getByRole('checkbox');
    this.submitButton = page.getByRole('button', { name: /^sign up$/i });
    this.signInLink = page.getByRole('link', { name: /^sign in$/i });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/signup/i);
    await expect(this.page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }

  async completeRequiredFields(email) {
    await this.emailInput.fill(email);
    await this.termsCheckbox.check({ force: true });
  }

  async goToLogin() {
    await this.signInLink.click();
  }

  async submit() {
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  async expectVerificationStep() {
    await expect(this.page).toHaveURL(/sso\.sleekflow\.io\/u\/signup/i);

    const verificationStep = this.page
      .getByRole('heading', { name: /check your email|verify your email|create.*password|set.*password/i })
      .or(this.page.getByRole('textbox', { name: /password/i }));

    await expect(verificationStep).toBeVisible({ timeout: 15000 });
  }
}